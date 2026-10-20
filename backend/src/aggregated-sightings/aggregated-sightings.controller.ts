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
} from '@nestjs/common';
import { AggregatedSightingsService } from './aggregated-sightings.service.js';
import { CreateAggregatedSightingDto } from './dto/create-aggregated-sighting.dto.js';
import { UpdateAggregatedSightingDto } from './dto/update-aggregated-sighting.dto.js';

@Controller('aggregated-sightings')
export class AggregatedSightingsController {
  constructor(
    private readonly aggregatedSightingsService: AggregatedSightingsService,
  ) {}

  @Post()
  create(@Body() createAggregatedSightingDto: CreateAggregatedSightingDto) {
    return this.aggregatedSightingsService.create(createAggregatedSightingDto);
  }

  @Get()
  findAll(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
  ) {
    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new HttpException(
        'Invalid or missing parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.aggregatedSightingsService.findAll(latitude, longitude);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.aggregatedSightingsService.findOne(+id);
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
