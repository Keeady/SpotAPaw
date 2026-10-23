import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResultRow } from 'pg';
import { QueueMessage } from './queue.constants.js';

/**
 * Thin wrapper over the pgmq SQL API using a direct Postgres connection.
 * Use the Supabase direct connection or session pooler string in SUPABASE_DB_URL.
 * (pgmq_public via PostgREST does not expose set_vt, which we need for backoff.)
 */
@Injectable()
export class QueueService implements OnApplicationShutdown {
  private readonly pool: Pool;

  constructor(configService: ConfigService) {
    this.pool = new Pool({
      host: configService.getOrThrow<string>('DB_HOST'),
      port: Number(configService.getOrThrow<number>('DB_PORT')),
      user: configService.getOrThrow<string>('DB_USERNAME'),
      password: configService.getOrThrow<string>('DB_PASSWORD'),
      database: configService.getOrThrow<string>('DB'),
      max: Number(configService.get<number>('WORKER_DB_POOL_SIZE') ?? 10),
      ssl: { rejectUnauthorized: false },
    });
  }

  query<T extends QueryResultRow = any>(text: string, params: unknown[] = []) {
    return this.pool.query<T>(text, params);
  }

  async read<T>(
    queue: string,
    vtSec: number,
    qty: number,
  ): Promise<QueueMessage<T>[]> {
    const { rows } = await this.pool.query(
      'select msg_id, read_ct, enqueued_at, vt, message from pgmq.read($1, $2, $3)',
      [queue, vtSec, qty],
    );
    return rows;
  }

  async send(queue: string, payload: object, delaySec = 0): Promise<void> {
    await this.pool.query('select pgmq.send($1, $2::jsonb, $3)', [
      queue,
      JSON.stringify(payload),
      delaySec,
    ]);
  }

  async archive(queue: string, msgId: number): Promise<void> {
    await this.pool.query('select pgmq.archive($1, $2::bigint)', [
      queue,
      msgId,
    ]);
  }

  /** Reschedule a message: it becomes visible again after vtSec seconds. */
  async setVisibility(
    queue: string,
    msgId: number,
    vtSec: number,
  ): Promise<void> {
    await this.pool.query('select pgmq.set_vt($1, $2::bigint, $3)', [
      queue,
      msgId,
      vtSec,
    ]);
  }

  async metrics(queue: string) {
    const { rows } = await this.pool.query('select * from pgmq.metrics($1)', [
      queue,
    ]);
    return rows[0];
  }

  /** Closed last: consumers wait for in-flight work in beforeApplicationShutdown. */
  async onApplicationShutdown() {
    await this.pool.end();
  }
}
