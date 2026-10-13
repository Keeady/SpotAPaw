import { Module } from '@nestjs/common';
import { PetsService } from './pets.service.js';
import { PetsController } from './pets.controller.js';

@Module({
  controllers: [PetsController],
  providers: [PetsService],
})
export class PetsModule {}
