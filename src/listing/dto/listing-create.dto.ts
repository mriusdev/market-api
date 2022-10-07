import { Transform } from "class-transformer"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class ListingCreateDTO {
  @IsNotEmpty()
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @Transform(({ value }) => value && parseInt(value))
  @IsNotEmpty()
  category: number
}