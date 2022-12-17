import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class ListingImagesDeleteDTO {
  @IsNotEmpty()
  @IsObject()
  imageUrls: object;
}
