import { Injectable } from '@nestjs/common';
import { CreateAggregatedSightingDto } from './dto/create-aggregated-sighting.dto.js';
import { UpdateAggregatedSightingDto } from './dto/update-aggregated-sighting.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { AggregatedSighting } from './entities/aggregated-sighting.entity.js';
import { Repository } from 'typeorm';
import { toPublicSightings } from './util.js';

@Injectable()
export class AggregatedSightingsService {
  constructor(
    @InjectRepository(AggregatedSighting)
    private aggregatedSightingsRepository: Repository<AggregatedSighting>,
  ) {}
  
  create(createAggregatedSightingDto: CreateAggregatedSightingDto) {
    return 'This action adds a new aggregatedSighting';
  }

  async findAll() {
    const data = await this.aggregatedSightingsRepository.find();
    return toPublicSightings(data);
  }

  findOne(id: number) {
    return `This action returns a #${id} aggregatedSighting`;
  }

  update(id: number, updateAggregatedSightingDto: UpdateAggregatedSightingDto) {
    return `This action updates a #${id} aggregatedSighting`;
  }

  remove(id: number) {
    return `This action removes a #${id} aggregatedSighting`;
  }
}
