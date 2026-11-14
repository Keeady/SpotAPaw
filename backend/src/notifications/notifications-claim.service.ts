import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  NotificationSent,
  NotificationType,
} from './entities/notification-sent.entity.js';
import type { Recipient } from './subscriber-finder.service.js';

// Must comfortably exceed the queue visibility timeout (60s).
const STALE_CLAIM_MINUTES = 5;

@Injectable()
export class NotificationClaimService {
  constructor(
    @InjectRepository(NotificationSent)
    private readonly sent: Repository<NotificationSent>,
  ) {}

  /**
   * Atomically claims recipients for a sighting and returns only the ones this
   * call won. Skipped: already-sent rows, and fresh pending claims held by
   * another worker. Stale pending claims (crashed worker) are retaken.
   */
  async claim(
    sightingId: string,
    type: NotificationType,
    recipients: Recipient[],
  ): Promise<Recipient[]> {
    if (recipients.length === 0) return [];

    const rows: { push_token: string }[] = await this.sent.query(
      `
      insert into notifications_sent
        (sighting_id, push_token, type, status, claimed_at)
      select $1, r.push_token, $2, 'pending', now()
      from unnest($4::text[]) as r(push_token)
      on conflict (sighting_id, push_token, type) do update
        set claimed_at = now()
        where notifications_sent.status = 'pending'
          and notifications_sent.claimed_at < now() - make_interval(mins => $5)
      returning push_token
      `,
      [
        sightingId,
        type,
        recipients.map((r) => r.pushToken),
        STALE_CLAIM_MINUTES,
      ],
    );

    const won = new Set(rows.map((r) => r.push_token));
    return recipients.filter((r) => won.has(r.pushToken));
  }

  async markSent(
    sightingId: string,
    type: NotificationType,
    tokens: string[],
  ): Promise<void> {
    if (tokens.length === 0) return;
    await this.sent.update(
      { sightingId, type, pushToken: In(tokens) },
      { status: 'sent', sentAt: new Date() },
    );
  }

  /** Only deletes pending rows, so a confirmed send is never un-claimed. */
  async release(
    sightingId: string,
    type: NotificationType,
    tokens: string[],
  ): Promise<void> {
    if (tokens.length === 0) return;
    await this.sent.delete({
      sightingId,
      type,
      status: 'pending',
      pushToken: In(tokens),
    });
  }
}