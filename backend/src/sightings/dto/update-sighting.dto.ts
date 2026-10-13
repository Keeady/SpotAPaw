import { PartialType } from '@nestjs/mapped-types';
import { CreateSightingDto } from './create-sighting.dto.js';

export class UpdateSightingDto extends PartialType(CreateSightingDto) {}
