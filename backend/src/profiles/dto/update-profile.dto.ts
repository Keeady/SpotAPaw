import { Transform } from 'class-transformer';
import {
  IsEmail,
  isEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateProfileDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  firstname?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  lastname?: string;

  @IsOptional()
  @Transform(trimString)
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  countryCode?: string;
}
