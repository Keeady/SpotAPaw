export type JobType = 'matching' | 'poster-data' | 'notify' | 'poster-gen';

export const QUEUES: Record<JobType, string> = {
  matching: 'aggregated_sighting_matching',
  'poster-data': 'aggregated_sighting_poster_data',
  notify: 'aggregated_sighting_notify',
  'poster-gen': 'aggregated_sighting_poster_gen',
};

export const dlqName = (queue: string) => `${queue}_dlq`;

export interface AggregatedSightingMessage {
  aggregated_sighting_id: string;
}

export interface QueueMessage<T = unknown> {
  msg_id: number;
  read_ct: number;
  enqueued_at: Date;
  vt: Date;
  message: T;
}
 
export interface ConsumerOptions {
  /** Visibility timeout in seconds. Must exceed the slowest handler run. */
  visibilityTimeoutSec: number;
  /** Messages claimed per poll. */
  batchSize: number;
  /** Max deliveries before a message is moved to the DLQ. */
  maxAttempts: number;
  /** Sleep between polls when the queue is empty. */
  pollIntervalMs: number;
  /** Abort a handler after this long. Defaults to 80% of the visibility timeout. */
  handlerTimeoutMs?: number;
  /** Backoff: base * 2^(attempt-1), capped at max, with jitter. */
  backoffBaseSec: number;
  backoffMaxSec: number;
}
 
export const DEFAULT_CONSUMER_OPTIONS: ConsumerOptions = {
  visibilityTimeoutSec: 60,
  batchSize: 5,
  maxAttempts: 5,
  pollIntervalMs: 1000,
  backoffBaseSec: 5,
  backoffMaxSec: 600,
};
