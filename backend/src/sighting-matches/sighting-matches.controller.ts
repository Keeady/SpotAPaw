import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { GetMatchesQueryDto } from './dto/get-matches-query.dto.js';
import { SightingMatchesService } from './sighting-matches.service.js';

@Controller('sighting-matches')
export class SightingMatchesController {
  constructor(private readonly matches: SightingMatchesService) {}

  @Get()
  async list(@Query() query: GetMatchesQueryDto) {
    return this.matches.getMatchesForSighting(
      query.sightingId,
      query,
    );
  }
}
