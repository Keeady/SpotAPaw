import { Module } from '@nestjs/common';
import { AggregatedSightingsService } from './aggregated-sightings.service.js';
import { AggregatedSightingsController } from './aggregated-sightings.controller.js';

@Module({
  controllers: [AggregatedSightingsController],
  providers: [AggregatedSightingsService],
})
export class AggregatedSightingsModule {}
