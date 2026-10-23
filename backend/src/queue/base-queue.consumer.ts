import { BeforeApplicationShutdown, Logger } from '@nestjs/common';
import { JobTrackerService } from './job-tracker.service.js';
import { QueueService } from './queue.service.js';
import {
  ConsumerOptions,
  DEFAULT_CONSUMER_OPTIONS,
  JobType,
  QueueMessage,
  QUEUES,
  AggregatedSightingMessage,
  dlqName,
} from './queue.constants.js';

/** Throw this from a handler when retrying cannot help (bad data, deleted sighting...). */
export class NonRetryableError extends Error {}

/**
 * Generic pgmq consumer. Subclasses set `jobType` and implement `handle`.
 * It has no loop of its own: something calls `drain()` (the cron in QueueDrainService,
 * or the guarded HTTP endpoint when running on serverless).
 *
 * Lifecycle per message:
 *   read (hidden for visibility timeout) -> markRunning -> handle
 *     success         -> markSucceeded, archive
 *     retryable error -> markFailed, set_vt with exponential backoff
 *     read_ct > max   -> markDead, copy to DLQ, archive
 *     NonRetryable    -> markDead, copy to DLQ, archive
 */
export abstract class BaseQueueConsumer implements BeforeApplicationShutdown {
  protected abstract readonly jobType: JobType;
  protected readonly options: ConsumerOptions = DEFAULT_CONSUMER_OPTIONS;
  protected readonly logger = new Logger(this.constructor.name);

  private stopping = false;
  private inFlight?: Promise<number>;

  constructor(
    protected readonly pgmq: QueueService,
    protected readonly tracker: JobTrackerService,
  ) {}

  /** Do the work. Must be idempotent: it can run more than once per sighting. */
  protected abstract handle(
    payload: AggregatedSightingMessage,
    msg: QueueMessage<AggregatedSightingMessage>,
  ): Promise<void>;

  private get queue() {
    return QUEUES[this.jobType];
  }

  /**
   * Runs before onApplicationShutdown, so the DB pool (closed in PgmqService's
   * onApplicationShutdown) is still open while in-flight messages finish.
   */
  async beforeApplicationShutdown() {
    this.stopping = true;
    await this.inFlight;
  }

  /**
   * Process messages until the queue is empty or the time budget is spent.
   * Returns how many messages were handled. Calls never overlap on one instance:
   * a second call while one is running joins the running one.
   */
  drain(budgetMs: number): Promise<number> {
    if (!this.inFlight) {
      this.inFlight = this.runDrain(budgetMs).finally(() => {
        this.inFlight = undefined;
      });
    }
    return this.inFlight;
  }

  private async runDrain(budgetMs: number): Promise<number> {
    const deadline = Date.now() + budgetMs;
    let handled = 0;

    while (!this.stopping && Date.now() < deadline) {
      let messages: QueueMessage<AggregatedSightingMessage>[];
      try {
        messages = await this.pgmq.read<AggregatedSightingMessage>(
          this.queue,
          this.options.visibilityTimeoutSec,
          this.options.batchSize,
        );
      } catch (err) {
        this.logger.error(`read failed: ${(err as Error).message}`);
        break;
      }
      if (messages.length === 0) break;

      await Promise.allSettled(messages.map((m) => this.process(m)));
      handled += messages.length;
    }
    return handled;
  }

  private async process(msg: QueueMessage<AggregatedSightingMessage>) {
    const sightingId = msg.message?.aggregated_sighting_id;
    if (!sightingId) {
      this.logger.error(`msg ${msg.msg_id} has no sighting_id, discarding`);
      await this.pgmq.archive(this.queue, msg.msg_id);
      return;
    }

    try {
      // Too many deliveries: stop retrying.
      if (msg.read_ct > this.options.maxAttempts) {
        await this.deadLetter(msg, sightingId, 'max attempts exceeded');
        return;
      }

      const prev = await this.tracker.markRunning(sightingId, this.jobType);
      if (prev === 'succeeded') {
        // Redelivery of finished work: just clear the message.
        await this.pgmq.archive(this.queue, msg.msg_id);
        return;
      }

      await this.handle(msg.message, msg);

      await this.tracker.markSucceeded(sightingId, this.jobType);
      await this.pgmq.archive(this.queue, msg.msg_id);
    } catch (err) {
      await this.onError(msg, sightingId, err as Error);
    }
  }

  private async onError(
    msg: QueueMessage<AggregatedSightingMessage>,
    sightingId: string,
    err: Error,
  ) {
    const reason = err.message || String(err);
    this.logger.warn(
      `sighting=${sightingId} attempt=${msg.read_ct}/${this.options.maxAttempts} failed: ${reason}`,
    );

    try {
      if (
        err instanceof NonRetryableError ||
        msg.read_ct >= this.options.maxAttempts
      ) {
        await this.deadLetter(msg, sightingId, reason);
        return;
      }
      await this.tracker.markFailed(sightingId, this.jobType, reason);
      await this.pgmq.setVisibility(
        this.queue,
        msg.msg_id,
        this.backoffSec(msg.read_ct),
      );
    } catch (inner) {
      // If bookkeeping fails, the visibility timeout still brings the message back.
      this.logger.error(`error handling failed: ${(inner as Error).message}`);
    }
  }

  private async deadLetter(
    msg: QueueMessage<AggregatedSightingMessage>,
    sightingId: string,
    reason: string,
  ) {
    this.logger.error(`sighting=${sightingId} dead-lettered: ${reason}`);
    await this.tracker.markDead(sightingId, this.jobType, reason);
    await this.pgmq.send(dlqName(this.queue), {
      ...msg.message,
      error: reason,
      read_ct: msg.read_ct,
      original_msg_id: msg.msg_id,
    });
    await this.pgmq.archive(this.queue, msg.msg_id);
  }

  private backoffSec(attempt: number): number {
    const { backoffBaseSec, backoffMaxSec } = this.options;
    const exp = Math.min(backoffBaseSec * 2 ** (attempt - 1), backoffMaxSec);
    return Math.round(exp * (0.8 + Math.random() * 0.4)); // +/-20% jitter
  }
}
