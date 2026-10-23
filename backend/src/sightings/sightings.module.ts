import { Module } from '@nestjs/common';
import { SightingsService } from './sightings.service.js';
import { SightingsController } from './sightings.controller.js';
import { Sighting } from './entities/sighting.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [SightingsController],
  providers: [SightingsService],
  exports: [SightingsService],
  imports: [TypeOrmModule.forFeature([Sighting])]
})
export class SightingsModule {}
