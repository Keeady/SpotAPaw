import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SightingsService } from './sightings.service.js';
import { CreateSightingDto } from './dto/create-sighting.dto.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth-user.type.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';

@Controller('sightings')
export class SightingsController {
  constructor(private readonly sightingsService: SightingsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(
    @Body() createSightingDto: CreateSightingDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.sightingsService.create(userId || '', createSightingDto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('/my')
  async findAllMySightings(@CurrentUser() user: AuthUser) {
    return this.sightingsService.findAllMySightings(user.id);
  }

  @Get()
  async findAll(
    @Query('linked_sighting_id', ParseUUIDPipe) linked_sighting_id: string,
  ) {
    return this.sightingsService.findAll(linked_sighting_id);
  }
}
