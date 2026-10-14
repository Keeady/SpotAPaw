import { Module } from '@nestjs/common';
import { SightingsService } from './sightings.service.js';
import { SightingsController } from './sightings.controller.js';

@Module({
  controllers: [SightingsController],
  providers: [SightingsService],
  exports: [SightingsService],
})
export class SightingsModule {}
