import { Module } from '@nestjs/common';
import { AggregatedSightingsService } from './aggregated-sightings.service.js';
import { AggregatedSightingsController } from './aggregated-sightings.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregatedSighting } from './entities/aggregated-sighting.entity.js';

@Module({
  controllers: [AggregatedSightingsController],
  providers: [AggregatedSightingsService],
  imports: [TypeOrmModule.forFeature([AggregatedSighting])],
})
export class AggregatedSightingsModule {}
