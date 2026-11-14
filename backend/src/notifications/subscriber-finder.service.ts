import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SightingSubscription } from './entities/notification.entity.js';

export interface Recipient {
  pushToken: string;
}

@Injectable()
export class SubscriberFinderService {
  private readonly logger = new Logger(SubscriberFinderService.name);

  constructor(
    @InjectRepository(SightingSubscription)
    private readonly subscriptions: Repository<SightingSubscription>,
  ) {}

  /** One recipient per push token, even if several subscriptions cover the spot. */
  async findNearby(long: number, lat: number): Promise<Recipient[]> {
    const rows = await this.subscriptions
      .createQueryBuilder('s')
      .select('s.notification_push_token', 'pushToken')
      .distinctOn(['s.notification_push_token'])
      .where('s.enabled = true')
      .andWhere('s.notification_push_token IS NOT NULL')
      .andWhere("s.notification_Push_token <> ''")
      .andWhere(
        `ST_DWithin(
           s.center,
           CAST(ST_MakePoint(:long, :lat) AS geography),
           s.radiusKm * 1000
         )`,
        { long, lat },
      )
      .orderBy('s.notification_push_token')
      .getRawMany<Recipient>();

    return rows;
  }

  async disableTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return;
    await this.subscriptions.update(
      { notificationPushToken: In(tokens) },
      { enabled: false },
    );
    this.logger.log(`Disabled ${tokens.length} unregistered push token(s)`);
  }
}
