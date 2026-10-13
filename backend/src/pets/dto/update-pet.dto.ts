import { PartialType } from '@nestjs/mapped-types';
import { CreatePetDto } from './create-pet.dto.js';

export class UpdatePetDto extends PartialType(CreatePetDto) {}
