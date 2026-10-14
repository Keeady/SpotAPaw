import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SightingsModule } from './sightings/sightings.module.js';
import { PetsModule } from './pets/pets.module.js';
import { SightingContactsModule } from './sighting-contacts/sighting-contacts.module.js';
import { AggregatedSightingsModule } from './aggregated-sightings/aggregated-sightings.module.js';
import { UsersModule } from './users/users.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregatedSighting } from './aggregated-sightings/entities/aggregated-sighting.entity.js';
import { DataSource } from 'typeorm';
import * as pg from 'pg';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<number>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB'),
        entities: [AggregatedSighting],
        autoLoadEntities: true,
        driver: pg,
        retryAttempts: 10,
        extra: { max: 1 },
      }),
    }),
    SightingsModule,
    PetsModule,
    SightingContactsModule,
    AggregatedSightingsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
