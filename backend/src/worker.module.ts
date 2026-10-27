import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueModule } from './queue/queue.module.js';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import pg from 'pg';
import { Poster } from './poster/entities/poster.entity.js';
import { AggregatedSighting } from './aggregated-sightings/entities/aggregated-sighting.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    QueueModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<number>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB'),
        entities: [AggregatedSighting, Poster],
        autoLoadEntities: true,
        driver: pg,
        retryAttempts: 10,
        extra: { max: configService.getOrThrow<number>('WORKER_DB_POOL_SIZE') },
      }),
    }),
  ],
})
export class WorkerModule {
  constructor(private dataSource: DataSource) {}
}
