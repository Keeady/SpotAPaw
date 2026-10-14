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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB,
      entities: [AggregatedSighting],
      autoLoadEntities: true,
      driver: pg,
      retryAttempts: 2,
      extra: { max: 1}
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
