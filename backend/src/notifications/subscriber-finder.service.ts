import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SightingSubscription } from './entities/notification.entity.js';

export interface Recipient {
  userId: string | null;
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
      .select('s.notificationPushToken', 'pushToken')
      .addSelect('s.userId', 'userId')
      .distinctOn(['s.notificationPushToken'])
      .where('s.enabled = true')
      .andWhere('s.notificationPushToken IS NOT NULL')
      .andWhere("s.notificationPushToken <> ''")
      .andWhere(
        `ST_DWithin(
           s.center,
           CAST(ST_MakePoint(:long, :lat) AS geography),
           s.radiusKm * 1000
         )`,
        { long, lat },
      )
      .orderBy('s.notificationPushToken')
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
