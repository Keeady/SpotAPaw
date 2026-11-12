import { PartialType } from '@nestjs/mapped-types';
import { CreatePetclaimDto } from './create-petclaim.dto.js';

export class UpdatePetclaimDto extends PartialType(CreatePetclaimDto) {}
