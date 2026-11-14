import { Injectable, Logger } from '@nestjs/common';
import { PosterConsumer } from '../queue/consumers/poster-data.consumer.js';
import { QueueMaintenanceService } from '../queue/queue-maintenance.service.js';
import { MatchingConsumer } from '../queue/consumers/matching.consumer.js';
import { NotifyConsumer } from '../queue/consumers/notify.consumer.js';
import { PosterGenConsumer } from '../queue/consumers/poster-gen.consumer.js';

@Injectable()
export class JobsService {
  private readonly logger = new Logger("JobService");

  constructor(
    private readonly posterConsumer: PosterConsumer,
    private readonly matchingConsumer: MatchingConsumer,
    private readonly notifyConsumer: NotifyConsumer,
    private readonly posterGenConsumer: PosterGenConsumer,
    private readonly queueMaintenance: QueueMaintenanceService,
  ) {}

  async findAll() {
    const promises = [
      this.posterConsumer.start(),
      this.matchingConsumer.start(),
      this.notifyConsumer.start(),
      this.posterGenConsumer.start(),
    ];

    const [poster, match, notify, posterGen] = await Promise.allSettled(promises);
    if (poster) {
      this.logger.log(`poster job status: ${poster.status}`);
    }

    if (match) {
      this.logger.log(`match job status: ${match.status}`);
    }

    if (notify) {
      this.logger.log(`notify job status: ${notify.status}`);
    }

    if (posterGen) {
      this.logger.log(`posterGen job status: ${posterGen.status}`);
    }
  }
}
