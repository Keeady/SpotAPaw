import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from './queue/queue.module.js';
import { DataSource } from 'typeorm';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QueueModule],
})
export class WorkerModule {
  constructor(private dataSource: DataSource) {}
}
