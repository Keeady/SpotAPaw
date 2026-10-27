import { BeforeApplicationShutdown, Logger, OnApplicationBootstrap } from '@nestjs/common';
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

/** A handler ran past its time limit. Retryable. */
export class HandlerTimeoutError extends Error {}

/**
 * Generic pgmq consumer. Subclasses set `jobType` and implement `handle`.
 *
 * On application bootstrap it starts a polling loop: read a batch, process it, and read
 * again immediately; when the queue is empty, sleep `pollIntervalMs` first.
 *
 * Lifecycle per message:
 *   read (hidden for visibility timeout) -> markRunning -> handle (with time limit)
 *     success         -> markSucceeded, archive
 *     retryable error -> markFailed, set_vt with exponential backoff
 *     read_ct > max   -> markDead, copy to DLQ, archive
 *     NonRetryable    -> markDead, copy to DLQ, archive
 *
 * Handlers get an AbortSignal that fires when the time limit is hit. Pass it to fetch()
 * and other cancellable calls. A handler that ignores it keeps running in the background,
 * which is why handlers must be idempotent.
 */
export abstract class BaseQueueConsumer implements OnApplicationBootstrap, BeforeApplicationShutdown {
  protected abstract readonly jobType: JobType;
  protected readonly options: ConsumerOptions = DEFAULT_CONSUMER_OPTIONS;
  protected readonly logger = new Logger(this.constructor.name);

  private stopping = false;
  private loop?: Promise<void>;
  private wake?: () => void;

  constructor(
    protected readonly pgmq: QueueService,
    protected readonly tracker: JobTrackerService,
  ) {}

  /** Do the work. Must be idempotent: it can run more than once per sighting. */
  protected abstract handle(
    payload: AggregatedSightingMessage,
    msg: QueueMessage<AggregatedSightingMessage>,
    signal: AbortSignal,
  ): Promise<void>;

  private get queue() {
    return QUEUES[this.jobType];
  }

  /** Must stay below the visibility timeout, or another worker can claim the message mid-run. */
  private get handlerTimeoutMs() {
    return this.options.handlerTimeoutMs ?? Math.floor(this.options.visibilityTimeoutSec * 1000 * 0.8);
  }

  onApplicationBootstrap() {
    this.stopping = false;
    this.logger.log(
      `Consuming ${this.queue} (batch=${this.options.batchSize} vt=${this.options.visibilityTimeoutSec}s ` +
        `handlerTimeout=${this.handlerTimeoutMs}ms poll=${this.options.pollIntervalMs}ms)`,
    );
    this.loop = this.poll();
  }

  /**
   * Runs before onApplicationShutdown, so the DB pool (closed in PgmqService's
   * onApplicationShutdown) is still open while in-flight messages finish.
   */
  async beforeApplicationShutdown() {
    this.stopping = true;
    this.wake?.(); // cut a sleep short
    await this.loop;
  }

  private async poll() {
    while (!this.stopping) {
      let messages: QueueMessage<AggregatedSightingMessage>[];
      try {
        messages = await this.pgmq.read<AggregatedSightingMessage>(
          this.queue,
          this.options.visibilityTimeoutSec,
          this.options.batchSize,
        );
      } catch (err) {
        this.logger.error(`read failed: ${(err as Error).message}`);
        await this.sleep(this.options.pollIntervalMs * 5);
        continue;
      }

      if (messages.length === 0) {
        await this.sleep(this.options.pollIntervalMs);
        continue;
      }

      // process() handles its own errors; a full batch means read again right away.
      await Promise.allSettled(messages.map((m) => this.process(m)));
    }
  }

  private async process(msg: QueueMessage<AggregatedSightingMessage>) {
    const sightingId = msg.message?.aggregated_sighting_id;
    if (!sightingId) {
      this.logger.error(`msg ${msg.msg_id} has no sighting_id, discarding`);
      await this.pgmq.archive(this.queue, msg.msg_id).catch(() => undefined);
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

      await this.runHandler(msg);

      await this.tracker.markSucceeded(sightingId, this.jobType);
      await this.pgmq.archive(this.queue, msg.msg_id);
      this.logger.log(`sighting=${sightingId} done (attempt ${msg.read_ct})`);
    } catch (err) {
      await this.onError(msg, sightingId, err as Error);
    }
  }

  private async runHandler(msg: QueueMessage<AggregatedSightingMessage>) {
    const ms = this.handlerTimeoutMs;
    const ctrl = new AbortController();
    let timer: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        ctrl.abort();
        reject(new HandlerTimeoutError(`handler exceeded ${ms}ms`));
      }, ms);
    });

    try {
      // If the handler settles after the timeout wins, race() has already subscribed to it,
      // so a late rejection is not reported as unhandled.
      await Promise.race([this.handle(msg.message, msg, ctrl.signal), timeout]);
    } finally {
      clearTimeout(timer);
    }
  }

  private async onError(msg: QueueMessage<AggregatedSightingMessage>, sightingId: string, err: Error) {
    const reason = err.message || String(err);
    this.logger.warn(
      `sighting=${sightingId} attempt=${msg.read_ct}/${this.options.maxAttempts} failed: ${reason}`,
    );

    try {
      if (err instanceof NonRetryableError || msg.read_ct >= this.options.maxAttempts) {
        await this.deadLetter(msg, sightingId, reason);
        return;
      }
      await this.tracker.markFailed(sightingId, this.jobType, reason);
      await this.pgmq.setVisibility(this.queue, msg.msg_id, this.backoffSec(msg.read_ct));
    } catch (inner) {
      // If bookkeeping fails, the visibility timeout still brings the message back.
      this.logger.error(`error handling failed: ${(inner as Error).message}`);
    }
  }

  private async deadLetter(msg: QueueMessage<AggregatedSightingMessage>, sightingId: string, reason: string) {
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.wake = undefined;
        resolve();
      }, ms);
      this.wake = () => {
        clearTimeout(timer);
        this.wake = undefined;
        resolve();
      };
    });
  }
}