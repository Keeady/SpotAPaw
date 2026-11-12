import { IsDefined, IsString } from "class-validator";

export class CreatePetclaimDto {
    @IsDefined()
    @IsString()
    petId: string;

    @IsDefined()
    @IsString()
    sightingId: string;
}
