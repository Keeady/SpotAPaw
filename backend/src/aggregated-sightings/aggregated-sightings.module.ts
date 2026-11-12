import { Module } from '@nestjs/common';
import { AggregatedSightingsService } from './aggregated-sightings.service.js';
import { AggregatedSightingsController } from './aggregated-sightings.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregatedSighting } from './entities/aggregated-sighting.entity.js';
import { SightingsModule } from '../sightings/sightings.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [AggregatedSightingsController],
  providers: [AggregatedSightingsService],
  imports: [
    TypeOrmModule.forFeature([AggregatedSighting]),
    SightingsModule,
    AuthModule,
  ],
})
export class AggregatedSightingsModule {}
