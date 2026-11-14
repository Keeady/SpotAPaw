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
import { NotificationsService } from '../../notifications/notifications.service.js';

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
    tracker: JobTrackerService,
    private readonly notifications: NotificationsService,
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

    const s = rows[0];
    if (s.last_seen_lat == null || s.last_seen_long == null)
      throw new NonRetryableError(
        `sighting ${aggregated_sighting_id} has no location`,
      );

    await this.notifications.notifyNearbySubscribers({
      id: s.id,
      lat: s.last_seen_lat,
      long: s.last_seen_long,
      species: s.species,
      name: s.name,
      colors: s.colors,
      breed: s.breed,
      linkedSightingId: s.linked_sighting_id,
      petId: s.pet_id,
    });
  }
}
