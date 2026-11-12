import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateAggregatedSightingDto } from './dto/update-aggregated-sighting.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { AggregatedSighting } from './entities/aggregated-sighting.entity.js';
import { In, Repository } from 'typeorm';
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

  async findAll(latitude: number, longitude: number, radius: number) {
    // ~111 km per 1 degree latitude
    const latDegree = radius / 111;
    // adjust longitude scaling by latitude
    const lngDegree = radius / (111 * Math.cos(latitude * (Math.PI / 180)));

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

  async findByLinkedSightingId(id: string) {
    const data = await this.aggregatedSightingsRepository
      .createQueryBuilder('aggregated_sightings')
      .where('aggregated_sightings.linked_sighting_id = :id', { id })
      .orderBy('aggregated_sightings.created_at', 'DESC')
      .getMany();
    return toPublicSighting(data[0]);
  }

  /**
   * Active sightings with a pet description inside the bounding box around
   * (lat, lng). Same approximation as the original edge function:
   * ~111 km per degree of latitude, longitude scaled by cos(lat).
   */
  async findNearbyWithPetDescription(
    q: NearbyQuery,
  ): Promise<AggregatedSighting[]> {
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

    if (q.excludeId)
      qb.andWhere('s.id <> :excludeId', { excludeId: q.excludeId });

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

  async update(
    id: string,
    userId: string,
    updateAggregatedSightingDto: UpdateAggregatedSightingDto,
  ) {
    const changes = {} as AggregatedSighting;

    if (updateAggregatedSightingDto.photos) {
      changes.photos = updateAggregatedSightingDto.photos;
    }

    if (updateAggregatedSightingDto.name) {
      changes.name = updateAggregatedSightingDto.name;
    }

    if (updateAggregatedSightingDto.lastSeenLat) {
      changes.lastSeenLat = updateAggregatedSightingDto.lastSeenLat;
    }

    if (updateAggregatedSightingDto.lastSeenLong) {
      changes.lastSeenLong = updateAggregatedSightingDto.lastSeenLong;
    }

    if (updateAggregatedSightingDto.lastSeenLocation) {
      changes.lastSeenLocation = updateAggregatedSightingDto.lastSeenLocation;
    }

    if (updateAggregatedSightingDto.lastSeenTime) {
      changes.lastSeenTime = updateAggregatedSightingDto.lastSeenTime;
    }

    if (updateAggregatedSightingDto.note) {
      changes.note = updateAggregatedSightingDto.note;
    }

    if (updateAggregatedSightingDto.gender) {
      changes.gender = updateAggregatedSightingDto.gender;
    }

    if (updateAggregatedSightingDto.colors) {
      changes.colors = updateAggregatedSightingDto.colors;
    }

    if (updateAggregatedSightingDto.breed) {
      changes.breed = updateAggregatedSightingDto.breed;
    }

    if (updateAggregatedSightingDto.species) {
      changes.species = updateAggregatedSightingDto.species;
    }

    if (updateAggregatedSightingDto.features) {
      changes.features = updateAggregatedSightingDto.features;
    }

    if (updateAggregatedSightingDto.linkedSightingId) {
      changes.linkedSightingId = updateAggregatedSightingDto.linkedSightingId;
    }

    if (updateAggregatedSightingDto.isActive) {
      changes.isActive = updateAggregatedSightingDto.isActive;
    }

    if (updateAggregatedSightingDto.reporterName) {
      changes.reporterName = updateAggregatedSightingDto.reporterName;
    }

    if (updateAggregatedSightingDto.reporterPhone) {
      changes.reporterPhone = updateAggregatedSightingDto.reporterPhone;
    }

    if (updateAggregatedSightingDto.size) {
      changes.size = updateAggregatedSightingDto.size;
    }

    if (updateAggregatedSightingDto.collarDescription) {
      changes.collarDescription = updateAggregatedSightingDto.collarDescription;
    }

    if (updateAggregatedSightingDto.age) {
      changes.age = updateAggregatedSightingDto.age;
    }

    if (updateAggregatedSightingDto.behavior) {
      changes.behavior = updateAggregatedSightingDto.behavior;
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('Provide at least one editable field.');
    }

    const result = await this.aggregatedSightingsRepository.update(id, changes);

    return !!(result.affected && result.affected > 0);
  }

  async updateStatus(ids: string[], isActive: boolean) {
    const result = await this.aggregatedSightingsRepository.update(
      { id: In(ids) },
      {
        isActive,
      },
    );

    return !!(result.affected && result.affected > 0);
  }

  async findActivePetSightingsById(userId: string, petId: string) {
    return this.aggregatedSightingsRepository.findBy({
      petId,
      isActive: true,
      ownerId: userId,
    });
  }
}
