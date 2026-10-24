import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poster } from './entities/poster.entity.js';
import { PosterAiService } from './poster-ai.service.js';
import {
  GeneratePosterOptions,
  PosterCopy,
  PosterPayload,
  PosterSightingNotFoundError,
  PosterType,
} from './poster.types.js';
import { AggregatedSighting } from '../aggregated-sightings/entities/aggregated-sighting.entity.js';

const asText = (v: string[] | string | null | undefined): string =>
  Array.isArray(v) ? v.join(', ') : (v ?? '');

@Injectable()
export class PosterDataService {
  private readonly logger = new Logger(PosterDataService.name);

  constructor(
    @InjectRepository(Poster)
    private readonly posterRepo: Repository<Poster>,
    @InjectRepository(AggregatedSighting)
    private readonly sightingRepo: Repository<AggregatedSighting>,
    private readonly ai: PosterAiService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Idempotent: returns the existing poster if one was already created for
   * this sighting, otherwise builds, saves and returns a new one.
   * Throws PosterSightingNotFoundError if the sighting does not exist.
   */
  async generateForSighting(
    sightingId: string,
    opts: GeneratePosterOptions = {},
  ): Promise<Poster> {
    const existing = await this.posterRepo.findOne({ where: { sightingId } });
    if (existing) return existing;

    const sighting = await this.sightingRepo.findOne({
      where: { id: sightingId },
    });
    if (!sighting) throw new PosterSightingNotFoundError(sightingId);

    const posterType: PosterType = sighting.ownerId ? 'lost' : 'found';

    const bestPhotoUrl = await this.getBestPhotoUrl(sighting.petDescriptionId);
    const payload = this.buildPayload(sighting);
    const copy = await this.buildCopy(payload, posterType, opts);
    const photos: string[] = sighting.photos ?? [];

    const poster = this.posterRepo.create({
      sightingId,
      headline: copy.headline,
      subheadline: copy.subheadline,
      photoUrl: bestPhotoUrl || photos[0] || null,
      description: copy.description,
      cta: copy.cta,
      lastSeenLocation: copy.lastSeenLocation,
      lastSeenTime: copy.lastSeenDate,
      contactName: sighting.reporterName || '',
      contactPhone: sighting.reporterPhone || '',
      name: payload.name,
      breed: payload.breed,
      colors: payload.colors,
    });

    return this.posterRepo.save(poster);
  }

  /** Sets aggregated_sightings.poster_id / poster_url (safe to repeat). */
  async linkToSighting(sightingId: string, poster: Poster): Promise<void> {
    await this.sightingRepo.update(
      { id: sightingId },
      { posterId: poster.id, posterUrl: this.buildPosterUrl(poster) },
    );
  }

  /** Public link for the poster, or null */
  buildPosterUrl(poster: Poster): string | null {
    const base = this.config.get<string>('POSTER_BASE_URL');
    return base ? `${base.replace(/\/$/, '')}/${poster.id}` : null;
  }

  // ---- internals ----------------------------------------------------------

  // pet_desc_results has no entity here, so read the one column via raw SQL.
  private async getBestPhotoUrl(
    petDescriptionId?: number | null,
  ): Promise<string | null> {
    if (!petDescriptionId) return null;
    const rows: { best_photo_url: string | null }[] =
      await this.sightingRepo.manager.query(
        'select best_photo_url from pet_desc_results where id = $1 limit 1',
        [petDescriptionId],
      );
    return rows[0]?.best_photo_url ?? null;
  }

  private buildPayload(s: AggregatedSighting): PosterPayload {
    return {
      name: s.name || 'Unknown',
      breed: s.breed || '',
      species: s.species || '',
      lastSeenLocation: s.lastSeenLocation || '',
      lastSeenDate: s.lastSeenTime ? String(s.lastSeenTime) : '',
      note: s.note || '',
      behavior: s.behavior || '',
      age: s.age || 0,
      size: s.size || '',
      colors: asText(s.colors),
      collarDescription: s.collarDescription ?? [],
      features: s.features ?? [],
      gender: s.gender || '',
    };
  }

  private async buildCopy(
    payload: PosterPayload,
    type: PosterType,
    opts: GeneratePosterOptions,
  ): Promise<PosterCopy> {
    const fallback = this.templatedCopy(payload, type);
    const useAi =
      opts.useAi ?? this.config.get<string>('POSTER_AI_ENABLED') !== 'false';
    if (!useAi) return fallback;

    try {
      const ai = await this.ai.generateCopy(payload, type);
      return {
        headline: ai.headline || fallback.headline,
        subheadline: ai.subheadline || fallback.subheadline,
        description: ai.description || fallback.description,
        cta: ai.cta || fallback.cta,
        lastSeenLocation: ai.lastSeenLocation || fallback.lastSeenLocation,
        lastSeenDate: ai.lastSeenDate || fallback.lastSeenDate,
      };
    } catch (err) {
      // AI copy is a nicety; never fail the poster because of it.
      this.logger.warn(
        `AI copy failed, using template: ${(err as Error).message}`,
      );
      return fallback;
    }
  }

  private templatedCopy(p: PosterPayload, type: PosterType): PosterCopy {
    const species = p.species || 'pet';
    const lost = type === 'lost';
    return {
      headline: lost ? `Lost ${species}` : `Found ${species}`,
      subheadline: lost
        ? `Have you seen this ${species}?`
        : `Do you know this ${species}?`,
      description: this.petToText(p),
      cta: `If you see ${p.name !== 'Unknown' ? p.name : 'this pet'}, please contact us.`,
      lastSeenLocation: p.lastSeenLocation,
      lastSeenDate: p.lastSeenDate,
    };
  }

  private petToText(p: PosterPayload): string {
    const intro = `${p.species} is a ${p.size} size ${p.breed}.`;
    const colors = p.colors ? `Colors: ${p.colors}.` : '';
    const collar = asText(p.collarDescription);
    const features = asText(p.features);
    return [
      intro,
      colors,
      collar ? `Collar Description: ${collar}.` : '',
      features ? `Distinctive Features: ${features}.` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}