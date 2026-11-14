import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregatedSighting } from '../aggregated-sightings/entities/aggregated-sighting.entity.js';
import { Poster } from './entities/poster.entity.js';
import { PosterAiService } from './poster-ai.service.js';
import { PosterDataService } from './poster-data.service.js';
import { PosterController } from './poster.controller.js';
import { PosterService } from './poster.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { PosterPuppeteerGeneratorService } from './poster-puppeteer-generator.service.js';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AggregatedSighting]),
    TypeOrmModule.forFeature([Poster]),
    AuthModule,
  ],
  providers: [
    PosterAiService,
    PosterDataService,
    PosterService,
    PosterPuppeteerGeneratorService
  ],
  exports: [PosterDataService, PosterPuppeteerGeneratorService],
  controllers: [PosterController],
})
export class PosterModule {}
