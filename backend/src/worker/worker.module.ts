import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '../queue/queue.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QueueModule],
})
class WorkerModule {}
