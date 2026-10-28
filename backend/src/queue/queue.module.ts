import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PosterModule } from '../posters/poster.module.js';
import { MatchingConsumer } from './consumers/matching.consumer.js';
import { NotifyConsumer } from './consumers/notify.consumer.js';
import { PosterConsumer } from './consumers/poster-data.consumer.js';
import { JobTrackerService } from './job-tracker.service.js';
import { QueueMaintenanceService } from './queue-maintenance.service.js';
import { QueueService } from './queue.service.js';

@Module({
  imports: [ConfigModule, PosterModule],
  providers: [
    QueueService,
    JobTrackerService,
    MatchingConsumer,
    PosterConsumer,
    NotifyConsumer,
    QueueMaintenanceService,
  ],
  exports: [QueueService, JobTrackerService],
})
export class QueueModule {}
