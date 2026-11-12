import { Injectable, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { CreatePetclaimDto } from './dto/create-petclaim.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Petclaim } from './entities/petclaim.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class PetclaimsService {
  constructor(
    @InjectRepository(Petclaim)
    private readonly petClaimRepository: Repository<Petclaim>,
  ) {}

  async create(userId: string, createPetclaimDto: CreatePetclaimDto) {
    const result = await this.petClaimRepository.insert({
      petId: createPetclaimDto.petId,
      sightingId: createPetclaimDto.sightingId,
      ownerId: userId,
    });

    if (result.generatedMaps.length === 0) {
      throw new InternalServerErrorException('Pet claim not created.');
    }

    return result;
  }

  findAll(userId: string, sightingId: string) {
    return this.petClaimRepository.findBy({
      sightingId,
      ownerId: userId,
      confirmed: false
    });
  }
}
