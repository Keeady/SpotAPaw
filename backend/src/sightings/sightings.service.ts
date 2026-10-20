import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSightingDto } from './dto/create-sighting.dto.js';
import { UpdateSightingDto } from './dto/update-sighting.dto.js';
import { Sighting } from './entities/sighting.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicSighting, toPublicSightings } from './util.js';

@Injectable()
export class SightingsService {
  constructor(
    @InjectRepository(Sighting)
    private sightingsRepository: Repository<Sighting>,
  ) {}

  create(createSightingDto: CreateSightingDto) {
    return 'This action adds a new sighting';
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

  findOne(id: number): Sighting | undefined {
    return undefined;
  }

  update(id: number, updateSightingDto: UpdateSightingDto) {
    return `This action updates a #${id} sighting`;
  }

  remove(id: number) {
    return `This action removes a #${id} sighting`;
  }
}
