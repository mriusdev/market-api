import { Transform, Type } from "class-transformer";
import { IsIn, IsInt, IsNotEmpty, IsNumberString, IsOptional, IsString, Min } from "class-validator";
import { ALLOWED_CATEGORY_IDS } from "../../../config/categories";

export class ListingFilterDTO {
  @IsNumberString()
  @IsOptional()
  @IsIn(ALLOWED_CATEGORY_IDS)
  category: string

  @Type(() => Number)
  @IsInt()
  @Min(2)
  perPage: number

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number

  @IsOptional()
  @IsString()
  search: string
}
