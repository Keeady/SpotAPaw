import { Injectable } from '@nestjs/common';
import { CreateAggregatedSightingDto } from './dto/create-aggregated-sighting.dto.js';
import { UpdateAggregatedSightingDto } from './dto/update-aggregated-sighting.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { AggregatedSighting } from './entities/aggregated-sighting.entity.js';
import { Repository } from 'typeorm';
import { toPublicSighting, toPublicSightings } from './util.js';

const SIGHTING_RADIUSKM = 8.05;

@Injectable()
export class AggregatedSightingsService {
  constructor(
    @InjectRepository(AggregatedSighting)
    private aggregatedSightingsRepository: Repository<AggregatedSighting>,
  ) {}

  create(createAggregatedSightingDto: CreateAggregatedSightingDto) {
    return 'This action adds a new aggregatedSighting';
  }

  async findAll(latitude: number, longitude: number) {
    // ~111 km per 1 degree latitude
    const latDegree = SIGHTING_RADIUSKM / 111;
    // adjust longitude scaling by latitude
    const lngDegree =
      SIGHTING_RADIUSKM / (111 * Math.cos(latitude * (Math.PI / 180)));

    const minLat = latitude - latDegree;
    const maxLat = latitude + latDegree;
    const minLong = longitude - lngDegree;
    const maxLong = longitude + lngDegree;

    const data = await this.aggregatedSightingsRepository
      .createQueryBuilder('aggregated_sightings')
      .where('aggregated_sightings.is_active = true')
      .andWhere('aggregated_sightings.last_seen_lat >= :minLat', { minLat })
      .andWhere('aggregated_sightings.last_seen_lat <= :maxLat', { maxLat })
      .andWhere('aggregated_sightings.last_seen_long >= :minLong', { minLong })
      .andWhere('aggregated_sightings.last_seen_long <= :maxLong', { maxLong })
      .orderBy('aggregated_sightings.updated_at', 'DESC')
      .getMany();
    return toPublicSightings(data);
  }

  async findOne(id: string) {
    const data = await this.aggregatedSightingsRepository
      .createQueryBuilder('aggregated_sightings')
      .where('aggregated_sightings.id = :id', { id })
      .getOneOrFail();
    return toPublicSighting(data);
  }

  update(id: number, updateAggregatedSightingDto: UpdateAggregatedSightingDto) {
    return `This action updates a #${id} aggregatedSighting`;
  }

  remove(id: number) {
    return `This action removes a #${id} aggregatedSighting`;
  }
}
