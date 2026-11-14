import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import chromium from '@sparticuz/chromium';
import puppeteer, { Browser } from 'puppeteer-core';
import { Repository } from 'typeorm';
import { Poster } from './entities/poster.entity.js';

export class PosterNotFoundError extends Error {
  constructor(sightingId: string) {
    super(`no poster found for sighting ${sightingId}`);
    this.name = 'PosterNotFoundError';
  }
}

const BUCKET = 'pet_posters';
const DEFAULT_RENDER_BASE_URL = 'https://spotapaw.com/og/posters';
// Per-operation timeout. Keep two renders well under the consumer's visibility timeout (180s).
const RENDER_TIMEOUT_MS = 70_000;

@Injectable()
export class PosterPuppeteerGeneratorService {
  private readonly logger = new Logger(PosterPuppeteerGeneratorService.name);
  private readonly storage: SupabaseClient['storage'];
  private readonly renderBaseUrl: string;
  private readonly chromePath?: string;

  constructor(
    @InjectRepository(Poster)
    private readonly posterRepo: Repository<Poster>,
    configService: ConfigService,
  ) {
    const supabase = createClient(
      configService.getOrThrow<string>('SUPABASE_URL'),
      configService.getOrThrow<string>('SUPABASE_SECRET_KEYS'),
    );
    this.storage = supabase.storage;
    this.renderBaseUrl = (
      configService.get<string>('POSTER_RENDER_BASE_URL') ?? DEFAULT_RENDER_BASE_URL
    ).replace(/\/$/, '');
    this.chromePath = configService.get<string>('CHROME_PATH'); // local dev only
  }

  async generateForSighting(sightingId: string): Promise<Poster> {
    const poster = await this.posterRepo.findOne({ where: { sightingId } });
    if (!poster) throw new PosterNotFoundError(sightingId);

    const browser = await this.launchBrowser();
    try {
      const pdf = await this.renderPdf(browser, poster.id);
      const pdfUrl = await this.upload(`${sightingId}.pdf`, pdf, 'application/pdf');

      const png = await this.renderPng(browser, poster.id);
      const pngUrl = await this.upload(`${sightingId}.png`, png, 'image/png');

      await this.posterRepo.update({ id: poster.id }, { pdfUrl, pngUrl });
      return { ...poster, pdfUrl, pngUrl };
    } finally {
      await browser.close().catch((e) => this.logger.warn(`browser close failed: ${e}`));
    }
  }

  // ---- internals ----------------------------------------------------------

  private pageUrl(posterId: number): string {
    return `${this.renderBaseUrl}/${posterId}`;
  }

  private async launchBrowser(): Promise<Browser> {
    if (process.env.VERCEL) {
      return puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: 'shell',
        protocolTimeout: RENDER_TIMEOUT_MS,
      });
    }
    return puppeteer.launch({
      executablePath: this.chromePath,
      headless: true,
      protocolTimeout: RENDER_TIMEOUT_MS,
    });
  }

  private async renderPdf(browser: Browser, posterId: number): Promise<Buffer> {
    const page = await browser.newPage();
    try {
      page.setDefaultNavigationTimeout(RENDER_TIMEOUT_MS);
      await page.goto(this.pageUrl(posterId), { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A0',
        displayHeaderFooter: true,
        printBackground: false,
      });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  private async renderPng(browser: Browser, posterId: number): Promise<Buffer> {
    const page = await browser.newPage();
    try {
      page.setDefaultNavigationTimeout(RENDER_TIMEOUT_MS);
      await page.setViewport({ width: 1920, height: 1080 }); // Browserless default
      await page.goto(this.pageUrl(posterId), { waitUntil: 'networkidle0' });
      const png = await page.screenshot({ fullPage: true, type: 'png' });
      return Buffer.from(png);
    } finally {
      await page.close();
    }
  }

  private async upload(path: string, data: Buffer, contentType: string): Promise<string> {
    const bucket = this.storage.from(BUCKET);
    const { error } = await bucket.upload(path, data, { contentType, upsert: true });
    if (error) throw new Error(`Failed to upload ${path}: ${error.message}`);
    return bucket.getPublicUrl(path).data.publicUrl;
  }
}
