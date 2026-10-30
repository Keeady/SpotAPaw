import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { AggregatedSightingsService } from '../aggregated-sightings/aggregated-sightings.service.js';
import { SightingMatch } from './entities/sighting-match.entity.js';

/** Same values as the original edge function. */
export const MATCH_THRESHOLD = -0.8;
export const MATCH_COUNT = 5;
export const DEFAULT_RADIUS_KM = 10;
export const RECENCY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
/** A match at or above this score is considered "likely" and triggers a notification. */
export const LIKELY_MATCH_SCORE = Number(process.env.LIKELY_MATCH_SCORE ?? 0.85);

/**
 * Row shape returned by match_pet_sightings. match_id is bigint, which the pg
 * driver returns as a string. similarity_score is the inner product (negated
 * `<#>`), so for normalized embeddings it is cosine similarity: higher = closer.
 */
interface MatchRow {
  match_id: string;
  similarity_score: number;
}

export class SightingNotFoundError extends Error {
  constructor(public readonly sightingId: string) {
    super(`sighting ${sightingId} not found`);
    this.name = 'SightingNotFoundError';
  }
}

export interface ProcessMatchesResult {
  matches: SightingMatch[];
  /** Best match at/above LIKELY_MATCH_SCORE that has not been notified yet. */
  likelyMatch: SightingMatch | null;
}

export interface ProcessMatchesOptions {
  radiusKm?: number;
}

@Injectable()
export class SightingMatchesService {
  private readonly logger = new Logger(SightingMatchesService.name);

  constructor(
    @InjectRepository(SightingMatch)
    private readonly matchRepo: Repository<SightingMatch>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly sightings: AggregatedSightingsService,
  ) {}

  /**
   * Find nearby sightings, score them against this sighting's pet description,
   * and upsert the results. Idempotent: safe to run again on queue retry.
   *
   * @throws SightingNotFoundError when the sighting no longer exists.
   */
  async processMatches(
    sightingId: string,
    opts: ProcessMatchesOptions = {},
  ): Promise<ProcessMatchesResult> {
    const empty: ProcessMatchesResult = { matches: [], likelyMatch: null };

    const sighting = await this.sightings.findOne(sightingId);
    if (!sighting) throw new SightingNotFoundError(sightingId);
    if (
      !sighting.petDescriptionId ||
      sighting.lastSeenLat == null ||
      sighting.lastSeenLong == null
    ) {
      return empty;
    }

    const nearby = await this.sightings.findNearbyWithPetDescription({
      lat: sighting.lastSeenLat,
      lng: sighting.lastSeenLong,
      radiusKm: opts.radiusKm ?? DEFAULT_RADIUS_KM,
      updatedSince: new Date(Date.now() - RECENCY_WINDOW_MS),
      excludeId: sightingId,
    });

    // pet_description_id -> sighting id, so scores can be mapped back to sightings
    const sightingByPetDesc = new Map<number, string>();
    for (const s of nearby) {
      if (s.petDescriptionId != null) {
        sightingByPetDesc.set(Number(s.petDescriptionId), s.id);
      }
    }
    if (sightingByPetDesc.size === 0) return empty;

    const rows = await this.matchPetSightings(
      Number(sighting.petDescriptionId),
      [...sightingByPetDesc.keys()],
    );
    if (rows.length === 0) return empty; // no embedding yet, or nothing above threshold

    const toSave = rows
      .map((r) => ({
        sightingId,
        candidateSightingId: sightingByPetDesc.get(Number(r.match_id)),
        candidatePetDescriptionId: r.match_id,
        score: r.similarity_score,
      }))
      .filter(
        (r): r is typeof r & { candidateSightingId: string } =>
          r.candidateSightingId !== undefined,
      );

    // ON CONFLICT (sighting_id, candidate_sighting_id) DO UPDATE
    await this.matchRepo.upsert(toSave, ['sightingId', 'candidateSightingId']);

    const matches = await this.matchRepo.find({
      where: {
        sightingId,
        candidateSightingId: In(toSave.map((r) => r.candidateSightingId)),
      },
      order: { score: 'DESC' },
    });

    const likelyMatch =
      matches.find((m) => m.score >= LIKELY_MATCH_SCORE && !m.notifiedAt) ??
      null;

    this.logger.log(
      `sighting ${sightingId}: ${matches.length} matches, likely=${likelyMatch?.id ?? 'none'}`,
    );
    return { matches, likelyMatch };
  }

  /** Mark a match as notified so a retry does not publish match_found twice. */
  async markNotified(matchId: string): Promise<void> {
    await this.matchRepo.update(matchId, { notifiedAt: new Date() });
  }

  /** Matches for the frontend, best first, with the candidate sighting attached. */
  async getMatchesForSighting(
    sightingId: string,
    opts: { limit?: number; minScore?: number } = {},
  ) {
    const qb = this.matchRepo
      .createQueryBuilder('m')
      .where('m.sighting_id = :sightingId', { sightingId })
      .orderBy('m.score', 'DESC')
      .limit(opts.limit ?? MATCH_COUNT);
    if (opts.minScore !== undefined) {
      qb.andWhere('m.score >= :minScore', { minScore: opts.minScore });
    }
    const matches = await qb.getMany();

    const candidates = await this.sightings.findByIds(
      matches.map((m) => m.candidateSightingId),
    );
    const byId = new Map(candidates.map((c) => [c.id, c]));

    return matches.map((m) => ({
      id: m.id,
      score: m.score,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      sighting: byId.get(m.candidateSightingId) ?? null,
    }));
  }

  /**
   * Calls match_pet_sightings. The query vector is selected inside Postgres
   * from the sighting's own pet_desc_results row, so the embedding never
   * travels through Node. A missing embedding yields NULL, which returns no rows.
   */
  private async matchPetSightings(
    petDescriptionId: number,
    candidateIds: number[],
  ): Promise<MatchRow[]> {
    return this.dataSource.query(
      `select match_id, similarity_score
         from match_pet_sightings(
           (select embeddings from pet_desc_results where id = $1),
           $2::double precision,
           $3::integer,
           $4::integer[]
         )`,
      [petDescriptionId, MATCH_THRESHOLD, MATCH_COUNT, candidateIds],
    );
  }
}
