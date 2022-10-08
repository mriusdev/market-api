import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthAccessGuard } from '../auth/guard';
import { IGenericSuccessResponse } from '../common/interfaces';
import { ListingCreateDTO } from './dto';
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
  getListing(@Param('id') id: string): Promise<IGenericSuccessResponse> {
    // TODO: rework param transformation from string to int
    const idAsInt = Number.parseInt(id);
    return this.listingService.getListing(idAsInt);
  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @Patch(':id')
  updateListing() {

  }

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  deleteListing() {

  }
}
