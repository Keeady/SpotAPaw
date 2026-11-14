import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PosterModule } from '../posters/poster.module.js';
import { MatchingConsumer } from './consumers/matching.consumer.js';
import { NotifyConsumer } from './consumers/notify.consumer.js';
import { PosterConsumer } from './consumers/poster-data.consumer.js';
import { JobTrackerService } from './job-tracker.service.js';
import { QueueMaintenanceService } from './queue-maintenance.service.js';
import { QueueService } from './queue.service.js';
import { SightingMatchesModule } from '../sighting-matches/sighting-matches.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    ConfigModule,
    PosterModule,
    SightingMatchesModule,
    NotificationsModule,
  ],
  providers: [
    QueueService,
    JobTrackerService,
    MatchingConsumer,
    PosterConsumer,
    NotifyConsumer,
    QueueMaintenanceService,
  ],
  exports: [
    QueueService,
    JobTrackerService,
    PosterConsumer,
    JobTrackerService,
    MatchingConsumer,
    PosterConsumer,
    QueueMaintenanceService,
    NotifyConsumer
  ],
})
export class QueueModule {}
