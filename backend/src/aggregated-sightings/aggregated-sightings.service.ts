import { Injectable } from '@nestjs/common';
import { CreateAggregatedSightingDto } from './dto/create-aggregated-sighting.dto.js';
import { UpdateAggregatedSightingDto } from './dto/update-aggregated-sighting.dto.js';

@Injectable()
export class AggregatedSightingsService {
  create(createAggregatedSightingDto: CreateAggregatedSightingDto) {
    return 'This action adds a new aggregatedSighting';
  }

  findAll() {
    return [
      {
        id: '64b84c63-fde8-4d7e-b9f8-3fdff809be94',
        created_at: '2026-08-21T18:29:29.986909+00:00',
        linked_sighting_id: '781c15fb-f129-411f-81c2-0bd710eeaa91',
        is_active: true,
      },
    ];
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
