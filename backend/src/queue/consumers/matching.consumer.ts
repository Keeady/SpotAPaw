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
  SightingMatchesService,
  SightingNotFoundError,
} from '../../sighting-matches/sighting-matches.service.js';

@Injectable()
export class MatchingConsumer extends BaseQueueConsumer {
  protected readonly jobType: JobType = 'matching';

  // Embedding calls can be slow: give them a longer visibility timeout.
  protected readonly options = {
    ...DEFAULT_CONSUMER_OPTIONS,
    visibilityTimeoutSec: 120,
    batchSize: 3,
    maxAttempts: 5,
    pollIntervalMs: 1000,
    backoffBaseSec: 10,
    backoffMaxSec: 900,
  };

  constructor(
    pgmq: QueueService,
    tracker: JobTrackerService,
    private readonly matching: SightingMatchesService,
  ) {
    super(pgmq, tracker);
  }

  protected async handle({
    aggregated_sighting_id,
  }: AggregatedSightingMessage): Promise<void> {
    let result;
    try {
      result = await this.matching.processMatches(aggregated_sighting_id);
    } catch (err) {
      // A deleted sighting will never succeed on retry.
      if (err instanceof SightingNotFoundError) {
        throw new NonRetryableError(err.message);
      }
      throw err; // anything else is retried with backoff
    }

    if (result.likelyMatch) {
         await this.pgmq.send('aggregated_sighting_matching_found', {
           aggregated_sighting_id,
           match_id: result.likelyMatch.id,
         });
         await this.matching.markNotified(result.likelyMatch.id);
    }
  }
}