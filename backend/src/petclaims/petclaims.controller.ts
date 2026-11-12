import { Controller, Get, Post, Body, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { PetclaimsService } from './petclaims.service.js';
import { CreatePetclaimDto } from './dto/create-petclaim.dto.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('claims')
@UseGuards(SupabaseAuthGuard)
export class PetclaimsController {
  constructor(private readonly petclaimsService: PetclaimsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createPetclaimDto: CreatePetclaimDto) {
    return this.petclaimsService.create(userId, createPetclaimDto);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query("sightingId") sightingId: string
  ) {
    if (!sightingId) {
      throw new BadRequestException("Missing parameters")
    }
    return this.petclaimsService.findAll(userId, sightingId);
  }
}
