import { IsIn, IsNotEmpty, IsNumberString, IsOptional } from "class-validator";
import { ALLOWED_CATEGORY_IDS } from "../../../config/categories";

export class ListingFilterDTO {
  @IsNumberString()
  @IsOptional()
  @IsIn(ALLOWED_CATEGORY_IDS)
  category: string
}
