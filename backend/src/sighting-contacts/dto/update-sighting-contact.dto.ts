import { PartialType } from '@nestjs/mapped-types';
import { CreateSightingContactDto } from './create-sighting-contact.dto.js';

export class UpdateSightingContactDto extends PartialType(CreateSightingContactDto) {}
