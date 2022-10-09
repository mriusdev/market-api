import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ListingUpdateDTO {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  description?: string;

  @Transform(({ value }) => value && parseInt(value))
  @IsNotEmpty()
  @IsOptional()
  categoryId?: number;
}
