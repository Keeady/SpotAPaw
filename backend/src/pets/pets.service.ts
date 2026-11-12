import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entities/pet.entity.js';
import { UpdatePetDto } from './dto/update-pet.dto.js';
import { CreatePetDto } from './dto/create-pet.dto.js';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
  ) {}

  async findByOwner(userId: string) {
    return this.petRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.petPhotos', 'ph')
      .where('p.owner_id = :userId', { userId })
      .getMany();
  }

  async findPetById(userId: string, petId: string) {
    return this.petRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.petPhotos', 'ph')
      .where('p.id = :petId', { petId })
      .andWhere('p.owner_id = :userId', { userId })
      .getOneOrFail();
  }

  async createPet(userId: string, dto: CreatePetDto): Promise<string> {
    const changes: Partial<Exclude<Pet, 'id'>> = {};

    if (dto.name !== undefined) {
      changes.name = dto.name;
    }

    if (dto.breed !== undefined) {
      changes.breed = dto.breed;
    }

    if (dto.species !== undefined) {
      changes.species = dto.species;
    }

    if (dto.gender !== undefined) {
      changes.gender = dto.gender;
    }

    if (dto.colors !== undefined) {
      changes.colors = dto.colors;
    }

    if (dto.features !== undefined) {
      changes.features = dto.features;
    }

    if (dto.note !== undefined) {
      changes.note = dto.note;
    }

    if (dto.isLost !== undefined) {
      changes.isLost = dto.isLost;
    }

    if (dto.size !== undefined) {
      changes.size = dto.size;
    }

    if (dto.behavior !== undefined) {
      changes.behavior = dto.behavior;
    }

    if (dto.collarDescription !== undefined) {
      changes.collarDescription = dto.collarDescription;
    }

    if (dto.age !== undefined) {
      changes.age = dto.age;
    }

    if (dto.petDescriptionId !== undefined) {
      changes.petDescriptionId = dto.petDescriptionId;
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('Provide at least one editable field.');
    }

    const result = await this.petRepository.insert({
      ...changes,
      ownerId: userId,
    });

    if (result.identifiers.length === 0) {
      throw new InternalServerErrorException('Pet not created.');
    }

    return result.identifiers[0]['id'];
  }

  async updatePet(
    userId: string,
    petId: string,
    dto: UpdatePetDto,
  ): Promise<boolean> {
    const changes: Partial<Exclude<Pet, 'id'>> = {};

    if (dto.name !== undefined) {
      changes.name = dto.name;
    }

    if (dto.breed !== undefined) {
      changes.breed = dto.breed;
    }

    if (dto.species !== undefined) {
      changes.species = dto.species;
    }

    if (dto.gender !== undefined) {
      changes.gender = dto.gender;
    }

    if (dto.colors !== undefined) {
      changes.colors = dto.colors;
    }

    if (dto.features !== undefined) {
      changes.features = dto.features;
    }

    if (dto.note !== undefined) {
      changes.note = dto.note;
    }

    if (dto.isLost !== undefined) {
      changes.isLost = dto.isLost;
    }

    if (dto.size !== undefined) {
      changes.size = dto.size;
    }

    if (dto.behavior !== undefined) {
      changes.behavior = dto.behavior;
    }

    if (dto.collarDescription !== undefined) {
      changes.collarDescription = dto.collarDescription;
    }

    if (dto.age !== undefined) {
      changes.age = dto.age;
    }

    if (dto.petDescriptionId !== undefined) {
      changes.petDescriptionId = dto.petDescriptionId;
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('Provide at least one editable field.');
    }

    const pet = await this.findPetById(userId, petId);
    if (!pet) {
      throw new NotFoundException('Pet not found.');
    }

    const result = await this.petRepository.update({ id: petId }, changes);

    return !!(result.affected && result.affected > 0);
  }

  async deletePet(userId: string, petId: string): Promise<boolean> {
    const pet = await this.findPetById(userId, petId);
    if (!pet) {
      throw new NotFoundException('Pet not found.');
    }

    const result = await this.petRepository.softDelete({ id: petId });

    return !!(result.affected && result.affected > 0);
  }
}
