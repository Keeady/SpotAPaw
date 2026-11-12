import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateSightingDto } from './dto/create-sighting.dto.js';
import { UpdateSightingDto } from './dto/update-sighting.dto.js';
import { Sighting } from './entities/sighting.entity.js';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicSighting, toPublicSightings } from './util.js';

@Injectable()
export class SightingsService {
  constructor(
    @InjectRepository(Sighting)
    private sightingsRepository: Repository<Sighting>,
  ) {}

  create(createSightingDto: CreateSightingDto) {
    const changes = {} as Sighting;

    if (createSightingDto.photos) {
      changes.photos = createSightingDto.photos;
    }

    if (createSightingDto.name) {
      changes.name = createSightingDto.name;
    }

    if (createSightingDto.petId) {
      changes.petId = createSightingDto.petId;
    }

    if (createSightingDto.lastSeenLat) {
      changes.lastSeenLat = createSightingDto.lastSeenLat;
    }

    if (createSightingDto.lastSeenLong) {
      changes.lastSeenLong = createSightingDto.lastSeenLong;
    }

    if (createSightingDto.lastSeenLocation) {
      changes.lastSeenLocation = createSightingDto.lastSeenLocation;
    }

    if (createSightingDto.lastSeenTime) {
      changes.lastSeenTime = createSightingDto.lastSeenTime;
    }

    if (createSightingDto.note) {
      changes.note = createSightingDto.note;
    }

    if (createSightingDto.colors) {
      changes.colors = createSightingDto.colors;
    }

    if (createSightingDto.gender) {
      changes.gender = createSightingDto.gender;
    }

    if (createSightingDto.breed) {
      changes.breed = createSightingDto.breed;
    }

    if (createSightingDto.species) {
      changes.species = createSightingDto.species;
    }

    if (createSightingDto.features) {
      changes.features = createSightingDto.features;
    }

    if (createSightingDto.linkedSightingId) {
      changes.linkedSightingId = createSightingDto.linkedSightingId;
    }

    if (createSightingDto.isActive) {
      changes.isActive = createSightingDto.isActive;
    }

    if (createSightingDto.reporterId) {
      changes.reporterId = createSightingDto.reporterId;
    }

    if (createSightingDto.reporterName) {
      changes.reporterName = createSightingDto.reporterName;
    }

    if (createSightingDto.reporterPhone) {
      changes.reporterPhone = createSightingDto.reporterPhone;
    }

    if (createSightingDto.size) {
      changes.size = createSightingDto.size;
    }

    if (createSightingDto.collarDescription) {
      changes.collarDescription = createSightingDto.collarDescription;
    }

    if (createSightingDto.age) {
      changes.age = createSightingDto.age;
    }

    if (createSightingDto.behavior) {
      changes.behavior = createSightingDto.behavior;
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('Provide at least one editable field.');
    }

    return this.sightingsRepository.insert(changes);
  }

  async findAll(linked_sighting_id: string): Promise<PublicSighting[]> {
    const data = await this.sightingsRepository
      .createQueryBuilder('sighting')
      .where('sighting.id = :id', { id: linked_sighting_id })
      .orWhere('sighting.linked_sighting_id = :linked_sighting_id', {
        linked_sighting_id,
      })
      .getMany();

    if (data.length > 0) {
      return toPublicSightings(data);
    }
    return [];
  }

  async findAllMySightings(userId: string): Promise<PublicSighting[]> {
    if (!userId) {
      throw new UnauthorizedException();
    }

    const data = await this.sightingsRepository
      .createQueryBuilder('sighting')
      .where('sighting.reporterId = :id', { id: userId })
      .getMany();

    if (data.length > 0) {
      return toPublicSightings(data);
    }
    return [];
  }

  findOne(id: number): Sighting | undefined {
    return undefined;
  }

  updateStatus(ids: string[], isActive: boolean) {
    return this.sightingsRepository.update(
      { linkedSightingId: In(ids) },
      { isActive },
    );
  }

  remove(id: string) {
    return `This action removes a #${id} sighting`;
  }
}
