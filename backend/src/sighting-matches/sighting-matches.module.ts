import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregatedSightingsModule } from '../aggregated-sightings/aggregated-sightings.module.js';
import { SightingMatch } from './entities/sighting-match.entity.js';
import { SightingMatchesController } from './sighting-matches.controller.js';
import { SightingMatchesService } from './sighting-matches.service.js';
import { AggregatedSighting } from '../aggregated-sightings/entities/aggregated-sighting.entity.js';
import { AggregatedSightingsService } from '../aggregated-sightings/aggregated-sightings.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([SightingMatch]),
    TypeOrmModule.forFeature([AggregatedSighting]),
    AggregatedSightingsModule
  ],
  controllers: [SightingMatchesController],
  providers: [SightingMatchesService, AggregatedSightingsService],
  exports: [SightingMatchesService],
})
export class SightingMatchesModule {}
