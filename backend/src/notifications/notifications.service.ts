import { Injectable, Logger } from '@nestjs/common';
import { NotificationClaimService } from './notifications-claim.service.js';
import { NotificationType } from './entities/notification-sent.entity.js';
import { PushService } from './push.service.js';
import { SubscriberFinderService } from './subscriber-finder.service.js';

export interface SightingNotificationInput {
  id: string;
  lat: number;
  long: number;
  species: string;
  name?: string | null;
  colors?: string | null;
  breed?: string | null;
  linkedSightingId?: string | null;
  petId?: string | null;
}

const TYPE: NotificationType = 'new_sighting';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly finder: SubscriberFinderService,
    private readonly claims: NotificationClaimService,
    private readonly push: PushService,
  ) {}

  async notifyNearbySubscribers(
    sighting: SightingNotificationInput,
  ): Promise<{ found: number; claimed: number; sent: number }> {
    // 1. Find
    const found = await this.finder.findNearby(sighting.long, sighting.lat);
    if (found.length === 0) {
      this.logger.log(`No subscribers near sighting ${sighting.id}`);
      return { found: 0, claimed: 0, sent: 0 };
    }

    // 2. Claim
    const claimed = await this.claims.claim(sighting.id, TYPE, found);
    if (claimed.length === 0) {
      this.logger.log(`Nothing left to send for sighting ${sighting.id}`);
      return { found: found.length, claimed: 0, sent: 0 };
    }
    const tokens = claimed.map((r) => r.pushToken);

    // 3. Send
    let result;
    try {
      result = await this.push.send(
        tokens.map((to) => ({
          to,
          sound: 'default' as const,
          title: this.title(sighting),
          body: this.body(sighting),
          data: {
            sightingId: sighting.id,
            linkedSightingId: sighting.linkedSightingId,
            petId: sighting.petId,
          },
        })),
      );
    } catch (err) {
      await this.claims.release(sighting.id, TYPE, tokens);
      throw err;
    }

    // 4. Confirm. Invalid tokens count as handled: retrying can't help.
    await this.claims.markSent(sighting.id, TYPE, [
      ...result.sentTokens,
      ...result.invalidTokens,
    ]);
    await this.finder.disableTokens(result.invalidTokens);

    // 5. Release failures and throw so the queue retries only those.
    if (result.failedTokens.length > 0) {
      await this.claims.release(sighting.id, TYPE, result.failedTokens);
      throw new Error(
        `${result.failedTokens.length}/${tokens.length} pushes failed for sighting ${sighting.id}`,
      );
    }

    return {
      found: found.length,
      claimed: claimed.length,
      sent: result.sentTokens.length,
    };
  }

  private title(s: SightingNotificationInput): string {
    return `Have you seen ${s.name || `this ${s.species}`}?`;
  }

  private body(s: SightingNotificationInput): string {
    return `Looking for a lost ${s.colors ?? ''} ${s.breed ?? ''} ${s.species} nearby.`
      .replace(/\s+/g, ' ')
      .trim();
  }
}
