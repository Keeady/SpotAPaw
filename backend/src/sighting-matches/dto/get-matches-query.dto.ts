import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class GetMatchesQueryDto {
  @IsDefined()
  @IsUUID()
  sightingId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minScore?: number = 0.85;
}
