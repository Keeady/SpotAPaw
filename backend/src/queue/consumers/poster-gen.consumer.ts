import { Injectable } from '@nestjs/common';
import {
  BaseQueueConsumer,
  NonRetryableError,
} from '../base-queue.consumer.js';
import { JobTrackerService } from '../job-tracker.service.js';
import { QueueService } from '../queue.service.js';
import {
  DEFAULT_CONSUMER_OPTIONS,
  JobType,
  AggregatedSightingMessage,
} from '../queue.constants.js';
import {
  PosterGeneratorService,
  PosterNotFoundError,
} from '../../poster/poster-generator.service.js';

@Injectable()
export class PosterGenConsumer extends BaseQueueConsumer {
  protected readonly jobType: JobType = 'poster-gen';

  // Rendering is CPU/IO heavy: small batches, generous timeout.
  protected readonly options = {
    ...DEFAULT_CONSUMER_OPTIONS,
    visibilityTimeoutSec: 180,
    batchSize: 2,
    maxAttempts: 4,
    backoffBaseSec: 15,
  };

  constructor(
    pgmq: QueueService,
    tracker: JobTrackerService,
    private readonly generator: PosterGeneratorService,
  ) {
    super(pgmq, tracker);
  }

  protected async handle({
    aggregated_sighting_id,
  }: AggregatedSightingMessage): Promise<void> {
    try {
      // Renders PDF + PNG, upserts both to storage, saves URLs on the poster.
      await this.generator.generateForSighting(aggregated_sighting_id);
    } catch (err) {
      // The poster-data stage creates the poster before enqueueing this job,
      // so a missing poster won't fix itself on retry.
      if (err instanceof PosterNotFoundError) {
        throw new NonRetryableError(err.message);
      }
      throw err; // Browserless / storage / DB errors -> normal retry/backoff
    }
  }
}