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
export class PosterConsumer extends BaseQueueConsumer {
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
    tracker: JobTrackerService /*, private posters: PosterService */,
  ) {
    super(pgmq, tracker);
  }

  protected async handle({
    aggregated_sighting_id,
  }: AggregatedSightingMessage): Promise<void> {
    const { rows } = await this.pgmq.query(
      'select * from aggregated_sightings where id = $1',
      [aggregated_sighting_id],
    );
    if (rows.length === 0)
      throw new NonRetryableError(
        `sighting ${aggregated_sighting_id} not found`,
      );

    // TODO: gather data for the poster from a_sightings table, AI gen
    // save in poster table
    // update a_sightings with poster_id
    // TODO: update a_sightings.poster_url (idempotent UPDATE).
  }
}
