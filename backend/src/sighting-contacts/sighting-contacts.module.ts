import { Module } from '@nestjs/common';
import { SightingContactsService } from './sighting-contacts.service.js';
import { SightingContactsController } from './sighting-contacts.controller.js';

@Module({
  controllers: [SightingContactsController],
  providers: [SightingContactsService],
})
export class SightingContactsModule {}
