import { Transform, Type } from "class-transformer"
import { IsIn, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator"
import { ALLOWED_CATEGORY_IDS } from "../../../config/categories";

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

  @IsNumberString()
  @IsNotEmpty()
  @IsIn(ALLOWED_CATEGORY_IDS)
  category: string
}
