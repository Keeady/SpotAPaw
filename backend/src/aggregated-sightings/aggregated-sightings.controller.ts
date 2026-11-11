import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  ParseFloatPipe,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { AggregatedSightingsService } from './aggregated-sightings.service.js';
import { CreateAggregatedSightingDto } from './dto/create-aggregated-sighting.dto.js';
import { UpdateAggregatedSightingDto } from './dto/update-aggregated-sighting.dto.js';
import { SightingsService } from '../sightings/sightings.service.js';
import { GetAggregatedSightingsDto } from './dto/get-aggregated-sightings.dto.js';

@Controller('aggregated-sightings')
export class AggregatedSightingsController {
  constructor(
    private readonly aggregatedSightingsService: AggregatedSightingsService,
    private readonly sightingsService: SightingsService,
  ) {}

  @Post()
  create(@Body() createAggregatedSightingDto: CreateAggregatedSightingDto) {
    return this.aggregatedSightingsService.create(createAggregatedSightingDto);
  }

  @Get()
  findAll(@Query() query: GetAggregatedSightingsDto) {
    return this.aggregatedSightingsService.findAll(
      query.latitude,
      query.longitude,
      query.radius,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('linked_sighting_id', ParseUUIDPipe) linked_sighting_id: string,
  ) {
    const [summary, sightings] = await Promise.all([
      this.aggregatedSightingsService.findOne(id),
      this.sightingsService.findAll(linked_sighting_id),
    ]);

    if (summary.linkedSightingId !== linked_sighting_id) {
      throw new BadRequestException("Invalid IDs")
    }

    return {
      summary,
      sightings,
      hasOwner: false,
      claimed: false,
    };
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAggregatedSightingDto: UpdateAggregatedSightingDto,
  ) {
    return this.aggregatedSightingsService.update(
      +id,
      updateAggregatedSightingDto,
    );
  }
}
