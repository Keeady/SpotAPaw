import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pet } from './pet.entity.js';
import type { Relation } from 'typeorm';
import { PetDescription } from './pet-description.entity.js';

@Entity('pet_photos')
export class PetPhotos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: "public_url"})
  publicUrl: string;

  @ManyToOne(() => Pet, (pet) => pet.petPhotos)
  @JoinColumn({ name: 'pet_id' })
  pet: Relation<Pet>;

  @ManyToOne(() => PetDescription, (pet) => pet.petDescriptionPhotos)
  @JoinColumn({ name: 'pet_description_id' })
  petDescription: Relation<PetDescription> | null;
}
