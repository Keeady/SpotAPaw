import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_MAX_BATCH = 100;

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  sound?: 'default' | null;
  data?: Record<string, unknown>;
}

export interface PushResult {
  /** Accepted by Expo. */
  sentTokens: string[];
  /** Dead tokens (DeviceNotRegistered). Won't succeed on retry. */
  invalidTokens: string[];
  /** Transient failures worth retrying. */
  failedTokens: string[];
}

interface ExpoTicket {
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly accessToken: string;

  constructor(config: ConfigService) {
    this.accessToken = config.getOrThrow<string>(
      'EXPO_PUSH_NOTIFICATION_ACCESS_TOKEN',
    );
  }

  async send(messages: PushMessage[]): Promise<PushResult> {
    const result: PushResult = {
      sentTokens: [],
      invalidTokens: [],
      failedTokens: [],
    };

    for (let i = 0; i < messages.length; i += EXPO_MAX_BATCH) {
      const chunk = messages.slice(i, i + EXPO_MAX_BATCH);

      try {
        const res = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify(chunk),
        });

        if (!res.ok) {
          throw new Error(`${res.status} ${await res.text()}`);
        }

        const { data: tickets } = (await res.json()) as {
          data?: ExpoTicket[];
        };

        // Tickets come back in the same order as the messages sent.
        chunk.forEach((msg, idx) => {
          const ticket = tickets?.[idx];
          if (ticket?.status === 'ok') {
            result.sentTokens.push(msg.to);
          } else if (ticket?.details?.error === 'DeviceNotRegistered') {
            result.invalidTokens.push(msg.to);
          } else {
            this.logger.warn(
              `Push error for ${msg.to}: ${ticket?.message ?? 'no ticket returned'}`,
            );
            result.failedTokens.push(msg.to);
          }
        });
      } catch (err) {
        this.logger.error(`Expo chunk failed: ${(err as Error).message}`);
        result.failedTokens.push(...chunk.map((m) => m.to));
      }
    }

    return result;
  }
}
