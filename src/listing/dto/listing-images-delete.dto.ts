import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsNumberString, IsObject, IsString, ValidateNested } from 'class-validator';

class ListingImageDTO {
  @IsNotEmpty()
  @IsNumberString()
  id: string

  @IsNotEmpty()
  @IsString()
  imagePath: string
}

export class ListingImagesDeleteDTO {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => ListingImageDTO)
  @ValidateNested({ each: true })
  imageDetails: ListingImageDTO[];
}
