import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregatedSighting } from '../aggregated-sightings/entities/aggregated-sighting.entity.js';
import { Poster } from './entities/poster.entity.js';
import { PosterAiService } from './poster-ai.service.js';
import { PosterDataService } from './poster-data.service.js';
import { PosterGeneratorService } from './poster-generator.service.js';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AggregatedSighting]),
    TypeOrmModule.forFeature([Poster]),
  ],
  providers: [PosterAiService, PosterDataService, PosterGeneratorService],
  exports: [PosterDataService, PosterGeneratorService],
})
export class PosterModule {}
