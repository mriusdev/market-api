import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthAccessGuard } from '../auth/guard';
import { IGenericSuccessResponse } from '../common/interfaces';
import { ListingUpdatePayloadPipe } from '../common/pipes';
import { Role } from '../user/entities/roles.enum';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/roles/roles.decorator';
import { ListingCreateDTO, ListingFilterDTO, ListingImagesDeleteDTO, ListingImagesUpdateDTO, ListingUpdateDTO } from './dto';
import { ListingService } from './listing.service';
import { SuccessResponse, ISuccessResponse } from '../common/http/success-response';
import { TemporaryImagesService } from './temporary-images.service';
import { ListingPipe } from '../common/pipes/listing.pipe';
import { Listing } from '@prisma/client';

@Controller('listings')
export class ListingController {
  constructor(private listingService: ListingService, private temporaryImagesService: TemporaryImagesService) {}

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createListing(@Body() dto: ListingCreateDTO, @Req() req: Request): Promise<ISuccessResponse> {
    return SuccessResponse(await this.listingService.createListing(dto, req.user['id']));
  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('temporary-images')
  async uploadImages(
    @Req() req: Request,
    @UploadedFiles(new ParseFilePipe()) images: Express.Multer.File[]
  ): Promise<ISuccessResponse>
  {
    return SuccessResponse(await this.temporaryImagesService.saveImages(req.user['id'], images));
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async getListings(@Query() filterDto: ListingFilterDTO): Promise<ISuccessResponse>
  {
    return SuccessResponse(await this.listingService.getListings(filterDto));
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getListing(@Param('id', ParseIntPipe) id: number): Promise<ISuccessResponse> {
    return SuccessResponse(await this.listingService.getListing(id));
  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @Patch(':id')
  async updateListing(
    @Req() req: Request,
    @Param('id', ListingPipe) listing: Listing,
    @Body(new ListingUpdatePayloadPipe()) dto: ListingUpdateDTO
  ): Promise<ISuccessResponse> {
    return SuccessResponse(await this.listingService.updateListing(listing, req.user['id'], dto));
  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  deleteListing(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<IGenericSuccessResponse> {
    return this.listingService.deleteListing(id, req.user['id'])
  }
}
