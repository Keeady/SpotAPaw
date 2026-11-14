import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as pg from 'pg';
import { DataSource } from 'typeorm';
import { AggregatedSightingsModule } from './aggregated-sightings/aggregated-sightings.module.js';
import { AggregatedSighting } from './aggregated-sightings/entities/aggregated-sighting.entity.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PetsModule } from './pets/pets.module.js';
import { PosterModule } from './posters/poster.module.js';
import { SightingsModule } from './sightings/sightings.module.js';
import { UsersModule } from './users/users.module.js';
import { Poster } from './posters/entities/poster.entity.js';
import { SightingMatch } from './sighting-matches/entities/sighting-match.entity.js';
import { SightingMatchesModule } from './sighting-matches/sighting-matches.module.js';
import { Pet } from './pets/entities/pet.entity.js';
import { ProfileModule } from './profiles/profile.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { PetPhotos } from './pets/entities/pet-photo.entity.js';
import { PetDescription } from './pets/entities/pet-description.entity.js';
import { PetclaimsModule } from './petclaims/petclaims.module.js';
import { Petclaim } from './petclaims/entities/petclaim.entity.js';
import { JobsModule } from './jobs/jobs.module.js';
import { QueueModule } from './queue/queue.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';

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
        entities: [
          AggregatedSighting,
          Poster,
          SightingMatch,
          Pet,
          PetPhotos,
          PetDescription,
          Petclaim,
        ],
        autoLoadEntities: true,
        driver: pg,
        retryAttempts: 10,
        extra: { max: configService.getOrThrow<number>('WORKER_DB_POOL_SIZE') },
      }),
    }),
    SightingsModule,
    PetsModule,
    AggregatedSightingsModule,
    UsersModule,
    PosterModule,
    SightingMatchesModule,
    ProfileModule,
    SettingsModule,
    SettingsModule,
    PetclaimsModule,
    JobsModule,
    QueueModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
