import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobTrackerService } from './job-tracker.service.js';
import { MatchingConsumer } from './consumers/matching.consumer.js';
import { NotifyConsumer } from './consumers/notify.consumer.js';
import { PosterConsumer } from './consumers/poster-data.consumer.js';
import { QueueService } from './queue.service.js';

@Module({
  imports: [ConfigModule],
  providers: [
    QueueService,
    JobTrackerService,
    MatchingConsumer,
    PosterConsumer,
    NotifyConsumer,
  ],
  exports: [QueueService, JobTrackerService],
})
export class QueueModule {}
