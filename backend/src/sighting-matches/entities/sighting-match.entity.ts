import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * One row per (sighting, candidate) pair found by the vector search.
 * The unique index lets the matcher upsert idempotently, so queue retries
 * and re-processing never create duplicates.
 *
 * `sightingId` and `candidateSightingId` both reference aggregated_sightings.id.
 */
@Entity('sighting_matches')
@Index(
  'uq_sighting_matches_sighting_candidate',
  ['sightingId', 'candidateSightingId'],
  {
    unique: true,
  },
)
@Index('idx_sighting_matches_sighting_score', ['sightingId', 'score'])
export class SightingMatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sighting_id', type: 'uuid' })
  sightingId!: string;

  @Column({ name: 'candidate_sighting_id', type: 'uuid' })
  candidateSightingId!: string;

  /** pet_desc_results.id of the candidate, as returned by match_pet_sightings. */
  @Column({ name: 'candidate_pet_description_id', type: 'bigint' })
  candidatePetDescriptionId!: string; // bigint comes back from pg as a string

  /** Similarity score returned by match_pet_sightings (higher = closer). */
  @Column({ type: 'double precision' })
  score!: number;

  /** Set once a `match_found` message has been published, to avoid re-notifying. */
  @Column({ name: 'notified_at', type: 'timestamptz', nullable: true })
  notifiedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
