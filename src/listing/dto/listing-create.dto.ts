import { Transform, Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class ListingCreateDTO {
  @IsNotEmpty()
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2})
  price: number;

  @Transform(({ value }) => value && parseInt(value))
  @IsNotEmpty()
  category: number
}