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
    tracker: JobTrackerService /*, private matching: MatchingService */,
  ) {
    super(pgmq, tracker);
  }

  protected async handle({
    aggregated_sighting_id,
  }: AggregatedSightingMessage): Promise<void> {
    // 1. Load the sighting (throw NonRetryableError if it no longer exists).
    const { rows } = await this.pgmq.query(
      'select * from aggregated_sightings where id = $1',
      [aggregated_sighting_id],
    );
    if (rows.length === 0)
      throw new NonRetryableError(
        `sighting ${aggregated_sighting_id} not found`,
      );

    // 2. TODO: build embedding for the sighting and upsert keyed by sighting_id.
    // 3. TODO: vector search against lost-pet reports.
    // 4. TODO: upsert matches ON CONFLICT (sighting_id, candidate_id) DO UPDATE.
    // 5. TODO: if a likely match exists, publish a `match_found` message to its own
    //    queue instead of calling the notifier directly.
  }
}
