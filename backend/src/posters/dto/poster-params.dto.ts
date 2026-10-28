import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PosterParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  posterId!: number;
}
