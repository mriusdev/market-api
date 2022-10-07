import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthAccessGuard } from '../auth/guard';
import { ListingCreateDTO } from './dto';
import { ListingService } from './listing.service';

@Controller('listings')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @UseGuards(JwtAuthAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  createListing(@Body() dto: ListingCreateDTO, @Req() req: Request) {
    return this.listingService.createListing(dto, req.user['id']);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  getListings() {

  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  getListing() {

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
