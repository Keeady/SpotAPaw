import { IsDefined, IsUUID } from 'class-validator';

export class PetParamsDto {
  @IsDefined()
  @IsUUID()
  petId!: string;
}
