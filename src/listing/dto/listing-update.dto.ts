import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ListingUpdateDTO {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2})
  price?: number;

  @Transform(({ value }) => value && parseInt(value))
  @IsNotEmpty()
  @IsOptional()
  categoryId?: number;
}
