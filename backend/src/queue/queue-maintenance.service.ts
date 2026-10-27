import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service.js';
import { JobType, QUEUES, dlqName } from './queue.constants.js';

/**
 * Background housekeeping next to the consumers (plain timers, no scheduler package):
 *  - sweep:   every 5 min, re-enqueue jobs whose message was lost or never processed
 *  - metrics: every minute, log queue depth / age and warn on DLQ entries
 *
 * Env (optional): QUEUE_SWEEP_INTERVAL_MS, QUEUE_METRICS_INTERVAL_MS
 */
@Injectable()
export class QueueMaintenanceService
  implements OnApplicationBootstrap, BeforeApplicationShutdown
{
  private readonly logger = new Logger(QueueMaintenanceService.name);
  private readonly timers: NodeJS.Timeout[] = [];
  private readonly sweepEveryMs: number;
  private readonly metricsEveryMs: number;
  private stopped = false;

  constructor(
    config: ConfigService,
    private readonly pgmq: QueueService,
  ) {
    this.sweepEveryMs = Number(
      config.get('QUEUE_SWEEP_INTERVAL_MS') ?? 5 * 60_000,
    );
    this.metricsEveryMs = Number(
      config.get('QUEUE_METRICS_INTERVAL_MS') ?? 60_000,
    );
  }

  onApplicationBootstrap() {
    this.logger.log(
      `maintenance started: sweep every ${this.sweepEveryMs}ms, metrics every ${this.metricsEveryMs}ms`,
    );
    this.every(this.sweepEveryMs, 'sweep', () => this.sweepStuck());
    this.every(this.metricsEveryMs, 'metrics', () => this.reportMetrics());
    void this.reportMetrics(); // one right away, so startup shows queue state and DB connectivity
  }

  beforeApplicationShutdown() {
    this.stopped = true;
    this.timers.forEach(clearInterval);
  }

  /** Interval that never overlaps itself and never throws. */
  private every(ms: number, name: string, fn: () => Promise<unknown>) {
    let running = false;
    this.timers.push(
      setInterval(async () => {
        if (running || this.stopped) return;
        running = true;
        try {
          await fn();
        } catch (err) {
          this.logger.error(`${name} failed: ${(err as Error).message}`);
        } finally {
          running = false;
        }
      }, ms),
    );
  }

  /**
   * Safety net: a job that is still pending/running/failed long after creation and has no
   * message in its queue (lost, or archived after a crash mid-bookkeeping) gets re-enqueued.
   * Handlers are idempotent and markRunning skips succeeded jobs, so a spurious re-enqueue is safe.
   */
  async sweepStuck(olderThanMinutes = 15): Promise<{ requeued: number }> {
    const { rows } = await this.pgmq.query<{
      aggregated_sighting_id: string;
      job_type: JobType;
    }>(
      `select aggregated_sighting_id, job_type
         from aggregated_sighting_jobs
        where status in ('pending','running','failed')
          and coalesce(started_at, created_at) < now() - make_interval(mins => $1)
        limit 200`,
      [olderThanMinutes],
    );

    let requeued = 0;
    for (const { aggregated_sighting_id, job_type } of rows) {
      const queue = QUEUES[job_type];
      if (!queue) continue;

      // Queue name comes from our constants, never from user input.
      const existing = await this.pgmq.query(
        `select 1 from pgmq.q_${queue} where message->>'aggregated_sighting_id' = $1 limit 1`,
        [aggregated_sighting_id],
      );
      if (existing.rowCount) continue; // still queued (visible or hidden): leave it alone

      await this.pgmq.send(queue, { aggregated_sighting_id });
      await this.pgmq.query(
        `update aggregated_sighting_jobs set status = 'pending'
          where aggregated_sighting_id = $1 and job_type = $2`,
        [aggregated_sighting_id, job_type],
      );
      requeued++;
      this.logger.warn(
        `re-enqueued ${job_type} for sighting=${aggregated_sighting_id}`,
      );
    }
    return { requeued };
  }

  async reportMetrics() {
    for (const queue of Object.values(QUEUES)) {
      try {
        const m = await this.pgmq.metrics(queue);
        const depth = Number(m?.queue_length ?? 0);
        const visible = m?.queue_visible_length ?? '?';
        const oldest = Number(m?.oldest_msg_age_sec ?? 0);
        this.logger.log(
          `${queue}: depth=${depth} visible=${visible} oldest=${oldest}s`,
        );
        if (oldest > 300)
          this.logger.warn(`${queue}: oldest message is ${oldest}s old`);

        const dlq = await this.pgmq.metrics(dlqName(queue));
        if (Number(dlq?.queue_length ?? 0) > 0) {
          this.logger.warn(
            `${dlqName(queue)}: ${dlq.queue_length} dead-lettered message(s)`,
          );
        }
      } catch (err) {
        this.logger.error(
          `metrics failed for ${queue}: ${(err as Error).message}`,
        );
      }
    }
  }
}
