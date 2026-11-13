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
import { SupabaseAnonyMousGuard } from '../auth/supabase-anonymous.guard.js';

@Controller('sightings')
export class SightingsController {
  constructor(private readonly sightingsService: SightingsService) {}

  @Post()
  @UseGuards(SupabaseAnonyMousGuard)
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
    @Query('linkedSightingId', ParseUUIDPipe) linkedSightingId: string,
  ) {
    return this.sightingsService.findAll(linkedSightingId);
  }
}
