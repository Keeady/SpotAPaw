import { Injectable } from '@nestjs/common';
import { PosterDataService } from '../../poster/poster-data.service.js';
import { PosterSightingNotFoundError } from '../../poster/poster.types.js';
import {
  BaseQueueConsumer,
  NonRetryableError,
} from '../base-queue.consumer.js';
import { JobTrackerService } from '../job-tracker.service.js';
import {
  AggregatedSightingMessage,
  DEFAULT_CONSUMER_OPTIONS,
  JobType,
} from '../queue.constants.js';
import { QueueService } from '../queue.service.js';

@Injectable()
export class PosterConsumer extends BaseQueueConsumer {
  protected readonly jobType: JobType = 'poster-data';

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
    private readonly posters: PosterDataService,
  ) {
    super(pgmq, tracker);
  }

  protected async handle({
    aggregated_sighting_id,
  }: AggregatedSightingMessage): Promise<void> {
    /* const { rows } = await this.pgmq.query(
      'select * from aggregated_sightings where id = $1',
      [aggregated_sighting_id],
    );
    if (rows.length === 0)
      throw new NonRetryableError(
        `sighting ${aggregated_sighting_id} not found`,
      );
*/
    // TODO: gather data for the poster from aggregated_sightings table, AI gen
    // save in poster table
    // update aggregated_sightings with poster_id
    // TODO: update aggregated_sightings.poster_url (idempotent UPDATE).
    let poster;
    try {
      // Idempotent: returns the existing poster on retries.
      poster = await this.posters.generateForSighting(aggregated_sighting_id);
    } catch (err) {
      if (err instanceof PosterSightingNotFoundError) {
        throw new NonRetryableError(err.message);
      }
      throw err; // transient (DB, etc.) -> normal retry/backoff
    }

    await this.posters.linkToSighting(aggregated_sighting_id, poster);

    // Last step: hand off to the poster-gen stage that renders the actual

    await this.pgmq.send('aggregated_sighting_poster_gen', [
      JSON.stringify({
        aggregated_sighting_id,
        poster_id: poster.id,
      }),
    ]);
  }
}
