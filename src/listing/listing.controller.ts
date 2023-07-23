import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, Query, Req, SetMetadata, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthAccessGuard } from '../auth/guard';
import { IGenericSuccessResponse } from '../common/interfaces';
import { ValidatePayloadExistsPipe } from '../common/pipes';
import { Role } from '../user/entities/roles.enum';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/roles/roles.decorator';
import { ListingCreateDTO, ListingFilterDTO, ListingImagesDeleteDTO, ListingImagesUpdateDTO, ListingUpdateDTO } from './dto';
import { ListingService } from './listing.service';
import { SuccessResponse, ISuccessResponse } from '../common/helpers/responses/success-response';

@Controller('listings')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  createListing(@Body() dto: ListingCreateDTO, @Req() req: Request, @UploadedFiles() files: Array<Express.Multer.File>): Promise<IGenericSuccessResponse> {
    return this.listingService.createListing(dto, req.user['id'], files);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async getListings(@Query() filterDto: ListingFilterDTO): Promise<ISuccessResponse>
  {
    return SuccessResponse(await this.listingService.getListings(filterDto));
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  getListing(@Param('id', ParseIntPipe) id: number): Promise<IGenericSuccessResponse> {
    return this.listingService.getListing(id);
  }

  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @Patch(':id')
  @Roles([Role.ADMIN, Role.REGULAR])
  updateListing(@Req() req: Request, @Body(new ValidatePayloadExistsPipe()) dto: ListingUpdateDTO, @Param('id', ParseIntPipe) id: number): Promise<IGenericSuccessResponse> {
    return this.listingService.updateListing(id, req.user['id'], dto);
  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @Put(':id/images')
  @UseInterceptors(FilesInterceptor('files'))
  uploadListingImages(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @UploadedFiles() files: Array<Express.Multer.File>): Promise<IGenericSuccessResponse> {
    return this.listingService.uploadListingImages(id, req.user['id'], files);
  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  updateListingImages(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File, @Body() dto: ListingImagesUpdateDTO) {
    return this.listingService.updateListingImages(id, req.user['id'], file, dto);
  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id/images')
  deleteListingImages(@Req() req: Request, @Body() dto: ListingImagesDeleteDTO, @Param('id', ParseIntPipe) id: number) {
    return this.listingService.deleteListingImages(id, req.user['id'], dto)
  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  deleteListing(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<IGenericSuccessResponse> {
    return this.listingService.deleteListing(id, req.user['id'])
  }
}
