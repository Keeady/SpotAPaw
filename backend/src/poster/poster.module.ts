import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PosterAiService } from './poster-ai.service.js';
import { Poster } from './entities/poster.entity.js';
import { PosterService } from './poster.service.js';
import { AggregatedSighting } from '../aggregated-sightings/entities/aggregated-sighting.entity.js';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AggregatedSighting]),
    TypeOrmModule.forFeature([Poster]),
  ],
  providers: [PosterAiService, PosterService],
  exports: [PosterService],
})
export class PosterModule {}
