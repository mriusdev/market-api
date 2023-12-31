import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class ListingTextDataDTO 
{
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2})
  price?: number;
}

export class ListingUpdateDTO {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ListingTextDataDTO)
  listingTextData: ListingTextDataDTO;

  @IsOptional()
  @IsNumber({}, { each: true })
  deletedListingImages: number[];
}
