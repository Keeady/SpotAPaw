import { Module } from '@nestjs/common';
import { SightingsService } from './sightings.service.js';
import { SightingsController } from './sightings.controller.js';
import { Sighting } from './entities/sighting.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [SightingsController],
  providers: [SightingsService],
  exports: [SightingsService],
  imports: [TypeOrmModule.forFeature([Sighting]), AuthModule]
})
export class SightingsModule {}
