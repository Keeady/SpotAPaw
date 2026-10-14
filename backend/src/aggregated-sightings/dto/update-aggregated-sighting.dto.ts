import { PartialType } from '@nestjs/mapped-types';
import { CreateAggregatedSightingDto } from './create-aggregated-sighting.dto.js';

export class UpdateAggregatedSightingDto extends PartialType(CreateAggregatedSightingDto) {}
