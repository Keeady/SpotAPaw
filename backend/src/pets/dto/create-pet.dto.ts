import { ArrayNotEmpty, IsBoolean, IsDefined, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";

export class CreatePetDto {
    @IsDefined()
    @IsString()
    @MaxLength(100)
    @MinLength(1)
    name: string;

    @IsDefined()
    @IsString()
    @MaxLength(100)
    @MinLength(1)
    species: string;

    @IsDefined()
    @IsString()
    @MaxLength(100)
    @MinLength(1)
    breed: string;

    @ValidateIf((_object, value) => value === "Female" || value === "Male")
    @IsDefined()
    @IsString()
    gender: string;

    @IsNumber()
    age: number;

    @IsString()
    @MaxLength(100)
    colors: string;

    @IsString()
    @MaxLength(254)
    features: string;

    @IsOptional()
    @IsString()
    @MaxLength(254)
    note: string;

    @IsDefined()
    @MaxLength(5)
    @MinLength(1)
    @ArrayNotEmpty()
    photos: string[];

    @IsDefined()
    @IsString()
    @MaxLength(100)
    size: string;

    @IsOptional()
    @IsString()
    @MaxLength(254)
    collarDescription: string;

    @IsDefined()
    @IsString()
    @MaxLength(100)
    behavior: string;

    @IsDefined()
    @IsBoolean()
    isLost: boolean;
}
