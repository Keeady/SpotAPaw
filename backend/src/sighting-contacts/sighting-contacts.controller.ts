import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SightingContactsService } from './sighting-contacts.service.js';
import { CreateSightingContactDto } from './dto/create-sighting-contact.dto.js';
import { UpdateSightingContactDto } from './dto/update-sighting-contact.dto.js';

@Controller('sighting-contacts')
export class SightingContactsController {
  constructor(private readonly sightingContactsService: SightingContactsService) {}

  @Post()
  create(@Body() createSightingContactDto: CreateSightingContactDto) {
    return this.sightingContactsService.create(createSightingContactDto);
  }

  @Get()
  findAll() {
    return this.sightingContactsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sightingContactsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSightingContactDto: UpdateSightingContactDto) {
    return this.sightingContactsService.update(+id, updateSightingContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sightingContactsService.remove(+id);
  }
}
