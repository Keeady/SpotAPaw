import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pet } from './pet.entity.js';
import type { Relation } from 'typeorm';
import { PetPhotos } from './pet-photo.entity.js';

@Entity('pet_desc_results')
export class PetDescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: "description"})
  description: string;

  @OneToOne(() => Pet, (pet) => pet.petDescription)
  pet: Relation<Pet>;

  @OneToMany(() => PetPhotos, (pet) => pet.petDescription)
  petDescriptionPhotos: Relation<PetPhotos[]>;
}
