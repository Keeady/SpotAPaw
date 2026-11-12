import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'owner' })
export class User {
  @PrimaryColumn({ name: 'owner_id' })
  ownerId: string;

  @Column({ type: 'text', name: "firstname" })
  firstName: string;

  @Column({ type: 'text', name: "lastname" })
  lastName: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text', name: 'country_code' })
  countryCode: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt: Date | null;

  @Column({ type: 'bool', name: 'marked_for_deletion' })
  markedForDeletion: boolean;
}
