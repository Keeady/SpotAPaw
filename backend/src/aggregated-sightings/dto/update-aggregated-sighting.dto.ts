import { PartialType } from '@nestjs/mapped-types';
import { CreateAggregatedSightingDto } from './create-aggregated-sighting.dto.js';
import { IsBoolean } from 'class-validator';

export class UpdateAggregatedSightingDto extends PartialType(CreateAggregatedSightingDto) {
    @IsBoolean()
    isActive: boolean;
}
