import { Module } from '@nestjs/common';
import { PetclaimsService } from './petclaims.service.js';
import { PetclaimsController } from './petclaims.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { Petclaim } from './entities/petclaim.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [PetclaimsController],
  providers: [PetclaimsService],
  imports: [TypeOrmModule.forFeature([Petclaim]), AuthModule]
})
export class PetclaimsModule {}
