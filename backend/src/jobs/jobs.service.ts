import { Injectable } from '@nestjs/common';
import { PosterConsumer } from '../queue/consumers/poster-data.consumer.js';
import { QueueMaintenanceService } from '../queue/queue-maintenance.service.js';
import { MatchingConsumer } from '../queue/consumers/matching.consumer.js';
import { NotifyConsumer } from '../queue/consumers/notify.consumer.js';
import { PosterGenConsumer } from '../queue/consumers/poster-gen.consumer.js';

@Injectable()
export class JobsService {
  posterConsumer: PosterConsumer;
  queueMaintenance: QueueMaintenanceService;
  matchingConsumer: MatchingConsumer;
  notifyConsumer: NotifyConsumer;
  posterGenConsumer: PosterGenConsumer

  constructor(
    posterConsumer: PosterConsumer,
    matchingConsumer: MatchingConsumer,
    notifyConsumer: NotifyConsumer,
    posterGenConsumer: PosterGenConsumer,
    queueMaintenance: QueueMaintenanceService,
  ) {
    posterConsumer = posterConsumer;
    queueMaintenance = queueMaintenance;
    matchingConsumer = matchingConsumer;
    notifyConsumer = notifyConsumer;
    posterGenConsumer = posterGenConsumer;
  }

  async findAll() {
    const promises = [
      this.posterConsumer.start(),
      this.matchingConsumer.start(),
      this.notifyConsumer.start(),
      this.posterGenConsumer.start(),
      this.queueMaintenance.start(),
    ];

    await Promise.allSettled(promises);
    this.queueMaintenance.end();
  }
}
