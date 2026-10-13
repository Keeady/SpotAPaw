import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSightingDto } from './dto/create-sighting.dto.js';
import { UpdateSightingDto } from './dto/update-sighting.dto.js';
import { Sighting } from './entities/sighting.entity.js';

@Injectable()
export class SightingsService {
  create(createSightingDto: CreateSightingDto) {
    return 'This action adds a new sighting';
  }

  findAll(): Sighting[] {
    return [
      
    ];
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
