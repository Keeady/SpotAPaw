import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sighting_subscriptions')
export class SightingSubscription {
  @PrimaryColumn()
  id!: number;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ name: 'notification_push_token', type: 'text', nullable: true })
  notificationPushToken!: string | null;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    select: false, // don't hydrate the geography on normal reads
  })
  center!: unknown;

  @Column({ name: 'radius_km', type: 'float' })
  radiusKm!: number;
}
