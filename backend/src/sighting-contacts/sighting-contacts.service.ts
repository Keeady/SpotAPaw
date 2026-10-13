import { Injectable } from '@nestjs/common';
import { CreateSightingContactDto } from './dto/create-sighting-contact.dto.js';
import { UpdateSightingContactDto } from './dto/update-sighting-contact.dto.js';

@Injectable()
export class SightingContactsService {
  create(createSightingContactDto: CreateSightingContactDto) {
    return 'This action adds a new sightingContact';
  }

  findAll() {
    return `This action returns all sightingContacts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sightingContact`;
  }

  update(id: number, updateSightingContactDto: UpdateSightingContactDto) {
    return `This action updates a #${id} sightingContact`;
  }

  remove(id: number) {
    return `This action removes a #${id} sightingContact`;
  }
}
