import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, ParseUUIDPipe, Query } from '@nestjs/common';
import { SightingsService } from './sightings.service.js';
import { CreateSightingDto } from './dto/create-sighting.dto.js';
import { UpdateSightingDto } from './dto/update-sighting.dto.js';

@Controller('sightings')
export class SightingsController {
  constructor(private readonly sightingsService: SightingsService) {}

  @Post()
  create(@Body() createSightingDto: CreateSightingDto) {
    return this.sightingsService.create(createSightingDto);
  }

  @Get()
  async findAll(@Query("linked_sighting_id", ParseUUIDPipe) linked_sighting_id: string) {
    return this.sightingsService.findAll(linked_sighting_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sightingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSightingDto: UpdateSightingDto) {
    return this.sightingsService.update(+id, updateSightingDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sightingsService.remove(+id);
  }
}
