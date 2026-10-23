import { Injectable } from '@nestjs/common';
import { QueueService } from './queue.service.js';
import { JobType } from './queue.constants.js';

export type JobStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'dead';

/** Writes per-sighting, per-flow state to the aggregated_sighting_jobs table. */
@Injectable()
export class JobTrackerService {
  constructor(private readonly db: QueueService) {}

  /**
   * Marks the job running and bumps attempts.
   * Returns the previous status so callers can skip jobs that already succeeded
   * (a redelivery after a successful run whose archive call failed).
   */
  async markRunning(sightingId: string, type: JobType): Promise<JobStatus | null> {
    const { rows } = await this.db.query<{ prev_status: JobStatus }>(
      `with prev as (
         select status from aggregated_sighting_jobs
         where aggregated_sighting_id = $1 and job_type = $2
       )
       update aggregated_sighting_jobs j
          set status = case when j.status = 'succeeded' then j.status else 'running' end,
              attempts = case when j.status = 'succeeded' then j.attempts else j.attempts + 1 end,
              started_at = case when j.status = 'succeeded' then j.started_at else now() end
         from prev
        where j.aggregated_sighting_id = $1 and j.job_type = $2
        returning prev.status as prev_status`,
      [sightingId, type],
    );
    return rows[0]?.prev_status ?? null;
  }

  async markSucceeded(sightingId: string, type: JobType) {
    await this.db.query(
      `update aggregated_sighting_jobs
          set status = 'succeeded', completed_at = now(), last_error = null
        where aggregated_sighting_id = $1 and job_type = $2`,
      [sightingId, type],
    );
  }

  async markFailed(sightingId: string, type: JobType, error: string) {
    await this.db.query(
      `update aggregated_sighting_jobs
          set status = 'failed', last_error = $3
        where aggregated_sighting_id = $1 and job_type = $2`,
      [sightingId, type, error.slice(0, 2000)],
    );
  }

  async markDead(sightingId: string, type: JobType, error: string) {
    await this.db.query(
      `update aggregated_sighting_jobs
          set status = 'dead', last_error = $3, completed_at = now()
        where aggregated_sighting_id = $1 and job_type = $2`,
      [sightingId, type, error.slice(0, 2000)],
    );
  }
}