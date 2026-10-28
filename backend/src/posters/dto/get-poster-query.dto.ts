import { Type } from 'class-transformer';
import {
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class GetPosterQueryDto {
  @ValidateIf((_object, value) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  posterId?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsUUID()
  sightingId?: string;
}
