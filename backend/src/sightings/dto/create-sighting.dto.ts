import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSightingDto {
  @IsOptional()
  @IsString()
  petId: string;

  @IsDefined()
  @Type(() => Number)
  @IsLatitude()
  lastSeenLat: number;

  @IsDefined()
  @Type(() => Number)
  @IsLongitude()
  lastSeenLong: number;

  @IsString()
  @IsOptional()
  lastSeenLocation: string;

  @IsDateString()
  lastSeenTime: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsString()
  @IsNotEmpty()
  colors: string;

  @IsString()
  @IsNotEmpty()
  breed: string;

  @IsString()
  @IsNotEmpty()
  species: string;

  @IsString()
  @IsOptional()
  features?: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  linkedSightingId?: string;

  @IsBoolean()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  reporterName: string;

  @IsString()
  @IsOptional()
  reporterPhone: string;

  @IsString()
  @IsOptional()
  reporterId: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsOptional()
  collarDescription?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  age: number;

  @IsArray()
  photos: string[];

  @IsString()
  @IsOptional()
  behavior?: string;
}
