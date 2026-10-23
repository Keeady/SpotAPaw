import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'posters' })
export class Poster {
  @PrimaryColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'sighting_id', type: 'uuid' })
  sightingId!: string;

  @Column({ type: 'text' })
  headline!: string;

  @Column({ type: 'text' })
  subheadline!: string;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl!: string | null;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  cta!: string;

  @Column({ name: 'last_seen_location', type: 'text', default: '' })
  lastSeenLocation!: string;

  @Column({ name: 'last_seen_time', type: 'text', default: '' })
  lastSeenTime!: string;

  @Column({ name: 'contact_name', type: 'text', default: '' })
  contactName!: string;

  @Column({ name: 'contact_phone', type: 'text', default: '' })
  contactPhone!: string;

  @Column({ type: 'text', default: 'Unknown' })
  name!: string;

  @Column({ type: 'text', default: '' })
  breed!: string;

  @Column({ type: 'text', default: '' })
  colors!: string;
}