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
import {
  NotificationSightingNotFoundError,
  NotificationSightingNotRetryableError,
} from '../../notifications/notifications.type.js';

@Injectable()
export class NotifyConsumer extends BaseQueueConsumer {
  protected readonly jobType: JobType = 'notify';

  protected readonly options = {
    ...DEFAULT_CONSUMER_OPTIONS,
    visibilityTimeoutSec: 60,
    batchSize: 10,
    maxAttempts: 3,
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
    try {
      await this.notifications.notifyNearbySubscribers(aggregated_sighting_id);
    } catch (err) {
      if (
        err instanceof NotificationSightingNotFoundError ||
        err instanceof NotificationSightingNotRetryableError
      ) {
        throw new NonRetryableError(err.message);
      }
      throw err;
    }
  }
}
