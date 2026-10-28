import { Injectable } from '@nestjs/common';
import { CreateAggregatedSightingDto } from './dto/create-aggregated-sighting.dto.js';
import { UpdateAggregatedSightingDto } from './dto/update-aggregated-sighting.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { AggregatedSighting } from './entities/aggregated-sighting.entity.js';
import { Repository } from 'typeorm';
import { toPublicSighting, toPublicSightings } from './util.js';

export interface NearbyQuery {
  lat: number;
  lng: number;
  radiusKm: number;
  /** Only sightings updated at or after this date. */
  updatedSince: Date;
  /** Exclude this sighting (the one we are matching). */
  excludeId?: string;
}

@Injectable()
export class AggregatedSightingsService {
  constructor(
    @InjectRepository(AggregatedSighting)
    private aggregatedSightingsRepository: Repository<AggregatedSighting>,
  ) {}

  create(createAggregatedSightingDto: CreateAggregatedSightingDto) {
    return 'This action adds a new aggregatedSighting';
  }

  async findAll(latitude: number, longitude: number, radius: number) {
    // ~111 km per 1 degree latitude
    const latDegree = radius / 111;
    // adjust longitude scaling by latitude
    const lngDegree =
      radius / (111 * Math.cos(latitude * (Math.PI / 180)));

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

    /**
   * Active sightings with a pet description inside the bounding box around
   * (lat, lng). Same approximation as the original edge function:
   * ~111 km per degree of latitude, longitude scaled by cos(lat).
   */
  async findNearbyWithPetDescription(q: NearbyQuery): Promise<AggregatedSighting[]> {
    const latDelta = q.radiusKm / 111;
    const lngDelta = q.radiusKm / (111 * Math.cos((q.lat * Math.PI) / 180));

    const qb = this.aggregatedSightingsRepository
      .createQueryBuilder('s')
      .where('s.is_active = true')
      .andWhere('s.pet_description_id IS NOT NULL')
      .andWhere('s.last_seen_lat BETWEEN :minLat AND :maxLat', {
        minLat: q.lat - latDelta,
        maxLat: q.lat + latDelta,
      })
      .andWhere('s.last_seen_long BETWEEN :minLng AND :maxLng', {
        minLng: q.lng - lngDelta,
        maxLng: q.lng + lngDelta,
      })
      .andWhere('s.updated_at >= :since', { since: q.updatedSince });

    if (q.excludeId) qb.andWhere('s.id <> :excludeId', { excludeId: q.excludeId });

    return qb.getMany();
  }

  /** Bulk fetch, used to hydrate match results for the frontend. */
  async findByIds(ids: string[]): Promise<AggregatedSighting[]> {
    if (ids.length === 0) return [];
    return this.aggregatedSightingsRepository
      .createQueryBuilder('s')
      .where('s.id IN (:...ids)', { ids })
      .getMany();
  }

  update(id: number, updateAggregatedSightingDto: UpdateAggregatedSightingDto) {
    return `This action updates a #${id} aggregatedSighting`;
  }

  remove(id: number) {
    return `This action removes a #${id} aggregatedSighting`;
  }
}
