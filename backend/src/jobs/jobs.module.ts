import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { JobsController } from './jobs.controller.js';
import { QueueModule } from '../queue/queue.module.js';

@Module({
  controllers: [JobsController],
  providers: [JobsService],
  imports: [QueueModule]
})
export class JobsModule {}
