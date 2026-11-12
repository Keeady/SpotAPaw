import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PetsService } from './pets.service.js';
import { PetParamsDto } from './dto/pet-params.dto.js';
import { UpdatePetDto } from './dto/update-pet.dto.js';
import { CreatePetDto } from './dto/create-pet.dto.js';
import { AggregatedSightingsService } from '../aggregated-sightings/aggregated-sightings.service.js';

@Controller('pets')
@UseGuards(SupabaseAuthGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get('my')
  async getMyPets(@CurrentUser('id') userId: string) {
    return this.petsService.findByOwner(userId);
  }

  @Get('my/:petId')
  async getMyPetById(
    @CurrentUser('id') userId: string,
    @Param() params: PetParamsDto,
  ) {
    return this.petsService.findPetById(userId, params.petId);
  }

  @Post('my')
  async createPet(
    @CurrentUser('id') userId: string,
    @Body() body: CreatePetDto,
  ) {
    if (Object.keys(body).length === 0) {
      throw new BadRequestException('Provide at least one editable field.');
    }

    const id = await this.petsService.createPet(userId, body);

    if (!id) {
      throw new InternalServerErrorException('Failed to create pet');
    }

    return id;
  }

  @Patch('my/:petId')
  async updatePet(
    @CurrentUser('id') userId: string,
    @Param() params: PetParamsDto,
    @Body() body: UpdatePetDto,
  ) {
    if (Object.keys(body).length === 0) {
      throw new BadRequestException('Provide at least one editable field.');
    }

    const updated = await this.petsService.updatePet(
      userId,
      params.petId,
      body,
    );

    if (!updated) {
      throw new InternalServerErrorException('Failed to update pet.');
    }

    return updated;
  }

  @Delete('my/:petId')
  async deletePet(
    @CurrentUser('id') userId: string,
    @Param() params: PetParamsDto,
  ) {
    const deleted = await this.petsService.deletePet(userId, params.petId);

    if (!deleted) {
      throw new InternalServerErrorException('Failed to deleted pet.');
    }

    return deleted;
  }
}
