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
export class NotifyConsumer extends BaseQueueConsumer {
  protected readonly jobType: JobType = 'notify';

  protected readonly options = {
    ...DEFAULT_CONSUMER_OPTIONS,
    visibilityTimeoutSec: 60,
    batchSize: 10,
    maxAttempts: 6,
    backoffBaseSec: 5,
  };

  constructor(
    pgmq: QueueService,
    tracker: JobTrackerService /*, private push: PushService */,
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

    // TODO: resolve recipients (owners of nearby lost-pet reports, followers...).
    // For each recipient, claim the send first so retries never double-notify:
    //
    //   insert into notifications_sent (sighting_id, user_id, type)
    //   values ($1, $2, 'new_sighting')
    //   on conflict do nothing
    //   returning 1
    //
    // Only call the push provider when a row was returned. If the push then fails,
    // delete the claim row (or use a status column) so the retry can send again.
  }
}
