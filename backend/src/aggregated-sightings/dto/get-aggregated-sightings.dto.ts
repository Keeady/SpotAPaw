// dto/get-aggregated-sightings.dto.ts

import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  Min,
  Max,
  IsDefined,
} from 'class-validator';

const SIGHTING_RADIUSKM = 8.05;

export class GetAggregatedSightingsDto {
  @IsDefined()
  @Type(() => Number)
  @IsLatitude()
  latitude: number;

  @IsDefined()
  @Type(() => Number)
  @IsLongitude()
  longitude: number;

  // Radius in kilometers
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0.1)
  @Max(25)
  radius: number = SIGHTING_RADIUSKM;
}
