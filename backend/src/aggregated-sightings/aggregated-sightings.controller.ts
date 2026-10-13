import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AggregatedSightingsService } from './aggregated-sightings.service.js';
import { CreateAggregatedSightingDto } from './dto/create-aggregated-sighting.dto.js';
import { UpdateAggregatedSightingDto } from './dto/update-aggregated-sighting.dto.js';

@Controller('aggregated-sightings')
export class AggregatedSightingsController {
  constructor(private readonly aggregatedSightingsService: AggregatedSightingsService) {}

  @Post()
  create(@Body() createAggregatedSightingDto: CreateAggregatedSightingDto) {
    return this.aggregatedSightingsService.create(createAggregatedSightingDto);
  }

  @Get()
  findAll() {
    return this.aggregatedSightingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aggregatedSightingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAggregatedSightingDto: UpdateAggregatedSightingDto) {
    return this.aggregatedSightingsService.update(+id, updateAggregatedSightingDto);
  }
}
