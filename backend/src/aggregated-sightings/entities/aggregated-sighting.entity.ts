import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'aggregated_sightings' })
export class AggregatedSighting {
  @PrimaryColumn()
  id: string;

  @Column({
    name: 'created_at',
  })
  createdAt: string;

  @Column({
    name: 'updated_at',
  })
  updatedAt: string;

  @Column({
    name: 'pet_id',
  })
  petId: string;

  @Column({
    name: 'last_seen_lat',
  })
  lastSeenLat: number;

  @Column({
    name: 'last_seen_long',
  })
  lastSeenLong: number;

  @Column({
    name: 'last_seen_location'
  })
  lastSeenLocation: string;

  @Column({
    name: 'last_seen_time'
  })
  lastSeenTime: string;

  @Column()
  note: string;

  @Column()
  gender: string;

  @Column()
  colors: string;

  @Column()
  breed: string;

  @Column()
  species: string;

  @Column()
  features: string;

  @Column()
  name: string;

  @Column({
    name: 'linked_sighting_id'
  })
  linkedSightingId: string;

  @Column({
    name: 'is_active'
  })
  isActive: boolean;

  @Column({
    name: 'reporter_name'
  })
  reporterName: string;

  @Column({
    name: 'reporter_phone'
  })
  reporterPhone: string;

  @Column({
    name: 'reporter_id'
  })
  reporterId: string;

  @Column()
  size: string;

  @Column({
    name: 'collar_description'
  })
  collarDescription: string;

  @Column()
  age: number;

  @Column()
  photos: string[];

  @Column()
  behavior: string;
}
