import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthAccessGuard } from '../auth/guard';
import { IGenericSuccessResponse } from '../common/interfaces';
import { ValidatePayloadExistsPipe } from '../common/pipes';
import { ListingCreateDTO, ListingUpdateDTO } from './dto';
import { ListingService } from './listing.service';

@Controller('listings')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  createListing(@Body() dto: ListingCreateDTO, @Req() req: Request): Promise<IGenericSuccessResponse> {
    return this.listingService.createListing(dto, req.user['id']);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  getListings(): Promise<IGenericSuccessResponse> {
    return this.listingService.getListings();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  getListing(@Param('id', ParseIntPipe) id: number): Promise<IGenericSuccessResponse> {
    return this.listingService.getListing(id);
  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @Patch(':id')
  updateListing(@Req() req: Request, @Body(new ValidatePayloadExistsPipe()) dto: ListingUpdateDTO, @Param('id', ParseIntPipe) id: number): Promise<IGenericSuccessResponse> {
    return this.listingService.updateListing(id, req.user['id'], dto);
  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @Put(':id/images')
  @UseInterceptors(FilesInterceptor('files'))
  uploadListingImages(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @UploadedFiles() files: Array<Express.Multer.File>) {
    console.log('files', files);
    
    return this.listingService.uploadListingImages(id, req, files);
  }

  // TODO: add delete functionality
  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @Delete(':id/images')
  removeListingImage() {
  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  deleteListing(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<IGenericSuccessResponse> {
    return this.listingService.deleteListing(id, req.user['id'])
  }
}
