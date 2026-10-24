import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Repository } from 'typeorm';
import { Poster } from './entities/poster.entity.js';

export class PosterNotFoundError extends Error {
  constructor(sightingId: string) {
    super(`no poster found for sighting ${sightingId}`);
    this.name = 'PosterNotFoundError';
  }
}

const BUCKET = 'pet_posters';
const BROWSERLESS_BASE_URL = 'https://production-sfo.browserless.io';
const DEFAULT_RENDER_BASE_URL = 'https://spotapaw.com/og/posters';
// Must stay well under the consumer's visibility timeout (180s for two renders).
const RENDER_TIMEOUT_MS = 70_000;

@Injectable()
export class PosterGeneratorService {
  private readonly logger = new Logger(PosterGeneratorService.name);
  private readonly storage: SupabaseClient['storage'];
  private readonly browserlessToken: string;
  private readonly renderBaseUrl: string;

  constructor(
    @InjectRepository(Poster)
    private readonly posterRepo: Repository<Poster>,
    configService: ConfigService,
  ) {
    const supabase = createClient(
      configService.getOrThrow<string>('SUPABASE_URL'),
      configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
    this.storage = supabase.storage;
    this.browserlessToken = configService.getOrThrow<string>('BROWSERLESS_API_TOKEN');
    this.renderBaseUrl = (
      configService.get<string>('POSTER_RENDER_BASE_URL') ?? DEFAULT_RENDER_BASE_URL
    ).replace(/\/$/, '');
  }

  /**
   * Renders the poster page to PDF and PNG, uploads both to storage and saves
   * the public URLs on the poster row. Idempotent: files live at deterministic
   * paths and are upserted, and the row update writes the same values, so
   * retries overwrite rather than duplicate.
   * Throws PosterNotFoundError if no poster exists for the sighting yet.
   */
  async generateForSighting(sightingId: string): Promise<Poster> {
    const poster = await this.posterRepo.findOne({ where: { sightingId } });
    if (!poster) throw new PosterNotFoundError(sightingId);

    const pdf = await this.renderPdf(poster.id);
    const pdfUrl = await this.upload(
      `${sightingId}.pdf`,
      pdf,
      'application/pdf',
    );

    const png = await this.renderPng(poster.id);
    const pngUrl = await this.upload(`${sightingId}.png`, png, 'image/png');

    await this.posterRepo.update({ id: poster.id }, { pdfUrl, pngUrl });
    return { ...poster, pdfUrl, pngUrl };
  }

  // ---- internals ----------------------------------------------------------

  private pageUrl(posterId: number): string {
    return `${this.renderBaseUrl}/${posterId}`;
  }

  private renderPdf(posterId: number): Promise<Buffer> {
    return this.browserless('pdf', {
      url: this.pageUrl(posterId),
      options: {
        displayHeaderFooter: true,
        printBackground: false,
        format: 'A0',
      },
    });
  }

  private renderPng(posterId: number): Promise<Buffer> {
    return this.browserless('screenshot', {
      url: this.pageUrl(posterId),
      options: { fullPage: true, type: 'png' },
    });
  }

  private async browserless(
    endpoint: 'pdf' | 'screenshot',
    body: Record<string, unknown>,
  ): Promise<Buffer> {
    // Token is in the query string (as before); never log this URL.
    const url = `${BROWSERLESS_BASE_URL}/${endpoint}?token=${this.browserlessToken}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(RENDER_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(
        `Browserless ${endpoint} failed: ${response.status} ${response.statusText}`,
      );
    }
    return Buffer.from(await response.arrayBuffer());
  }

  private async upload(
    path: string,
    data: Buffer,
    contentType: string,
  ): Promise<string> {
    const bucket = this.storage.from(BUCKET);
    const { error } = await bucket.upload(path, data, {
      contentType,
      upsert: true,
    });
    if (error) {
      throw new Error(`Failed to upload ${path}: ${error.message}`);
    }

    // getPublicUrl is a pure URL builder; it has no error to check.
    return bucket.getPublicUrl(path).data.publicUrl;
  }
}
