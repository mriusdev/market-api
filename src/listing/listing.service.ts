import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListingCreateDTO } from './dto';

@Injectable()
export class ListingService {
  constructor(private prisma: PrismaService) {}

  async createListing(dto: ListingCreateDTO, userId: number) {
    return await this.prisma.listing.create({
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.category,
        userId: userId
      }
    })
  }
}
