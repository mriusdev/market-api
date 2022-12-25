import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsNumberString, IsObject, IsString, ValidateNested } from 'class-validator';

export class ListingImagesUpdateDTO {
  @IsNotEmpty()
  @IsNumberString()
  id: string

  @IsNotEmpty()
  @IsString()
  path: string
}
