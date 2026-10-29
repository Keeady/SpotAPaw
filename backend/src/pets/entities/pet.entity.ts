import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt: Date | null;

  @Index()
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  species: string | null;

  @Column({ type: 'text', nullable: true })
  breed: string | null;

  @Column({ type: 'text', nullable: true })
  gender: string | null;

  @Column({ type: 'integer', nullable: true })
  age: number | null;

  @Column({ type: 'text', nullable: true })
  colors: string | null;

  @Column({ type: 'text', nullable: true })
  features: string | null;

  @Column({
    name: 'last_seen_time',
    type: 'timestamptz',
    nullable: true,
  })
  lastSeenTime: Date | null;

  @Column({
    name: 'last_seen_lat',
    type: 'double precision',
    nullable: true,
  })
  lastSeenLat: number | null;

  @Column({
    name: 'last_seen_long',
    type: 'double precision',
    nullable: true,
  })
  lastSeenLong: number | null;

  @Column({
    name: 'last_seen_location',
    type: 'text',
    nullable: true,
  })
  lastSeenLocation: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'text', nullable: true })
  photo: string | null;

  @Column({
    name: 'pet_description_id',
    type: 'uuid',
    nullable: true,
  })
  petDescriptionId: string | null;

  @Column({
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  photos: string[];

  @Column({ type: 'text', nullable: true })
  size: string | null;

  @Column({
    name: 'collar_description',
    type: 'text',
    nullable: true,
  })
  collarDescription: string | null;

  @Column({
    name: 'is_lost',
    type: 'boolean',
    default: false,
  })
  isLost: boolean;
}
