import { Module } from '@nestjs/common';
import { PetsService } from './pets.service.js';
import { PetsController } from './pets.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './entities/pet.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Pet]), AuthModule, ConfigModule],
  controllers: [PetsController],
  providers: [PetsService],
})
export class PetsModule {}
