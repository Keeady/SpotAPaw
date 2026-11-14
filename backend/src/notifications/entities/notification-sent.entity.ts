import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';

export type NotificationType = 'new_sighting';
export type NotificationStatus = 'pending' | 'sent';

@Entity('notifications_sent')
@Unique(['sightingId', 'pushToken', 'type'])
export class NotificationSent {
  @PrimaryColumn()
  id!: number;

  @Column({ name: 'sighting_id', type: 'uuid' })
  sightingId!: string;

  @Column({ name: 'push_token', type: 'text' })
  pushToken!: string;

  @Column({ type: 'text' })
  type!: NotificationType;

  @Column({ type: 'text', default: 'pending' })
  status!: NotificationStatus;

  @Column({ name: 'claimed_at', type: 'timestamptz', default: () => 'now()' })
  claimedAt!: Date;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;
}
