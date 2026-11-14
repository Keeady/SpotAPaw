import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service.js';
import { PushService } from './push.service.js';
import { SightingSubscription } from './entities/notification.entity.js';
import { NotificationSent } from './entities/notification-sent.entity.js';
import { SubscriberFinderService } from './subscriber-finder.service.js';
import { NotificationClaimService } from './notifications-claim.service.js';
import { AggregatedSighting } from '../aggregated-sightings/entities/aggregated-sighting.entity.js';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      SightingSubscription,
      NotificationSent,
      AggregatedSighting,
    ]),
  ],
  providers: [
    NotificationsService,
    SubscriberFinderService,
    NotificationClaimService,
    PushService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
