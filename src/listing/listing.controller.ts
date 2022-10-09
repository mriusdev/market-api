import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
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
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  deleteListing(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<IGenericSuccessResponse> {
    return this.listingService.deleteListing(id, req.user['id'])
  }
}
