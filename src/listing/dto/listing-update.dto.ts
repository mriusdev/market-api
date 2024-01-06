import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

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

class ModifiedListingImageDataDTO
{
  @IsOptional()
  @IsNumber({}, { each: true })
  deletedImageIds: number[];

  @IsOptional()
  @IsBoolean()
  newImagesAdded: boolean;
}

export class ListingUpdateDTO {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ListingTextDataDTO)
  listingTextData: ListingTextDataDTO;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ModifiedListingImageDataDTO)
  modifiedListingImageData: ModifiedListingImageDataDTO
}
