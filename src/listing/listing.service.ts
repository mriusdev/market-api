import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { NotFoundError } from '@prisma/client/runtime';
import { GenericException } from '../common/helpers/exceptions';
import { GenericSuccessResponse } from '../common/helpers/responses';
import { IGenericSuccessResponse } from '../common/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { ListingCreateDTO, ListingUpdateDTO } from './dto';

@Injectable()
export class ListingService {
  constructor(private prisma: PrismaService) {}

  async createListing(dto: ListingCreateDTO, userId: number): Promise<IGenericSuccessResponse> {
    try {
      await this.prisma.listing.create({
        data: {
          title: dto.title,
          description: dto.description,
          categoryId: dto.category,
          userId: userId
        }
      })

      return GenericSuccessResponse(HttpStatus.CREATED, 'Listing created')
      
    } catch (error) {
      throw new GenericException()
    }
  }

  async getListings(): Promise<IGenericSuccessResponse>
  {
    try {
      const listings = await this.prisma.listing.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          author: {
            select: {
              username: true
            }
          },
          category: {
            select: {
              name: true,
              description: true
            }
          }
        }
      })

      return GenericSuccessResponse(undefined, undefined, listings)
    } catch (error) {
      throw new GenericException()
    }
  }

  async getListing(id: number): Promise<IGenericSuccessResponse>
  {
    try {
      const listing = await this.prisma.listing.findFirstOrThrow({
        where: {
          id
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          author: {
            select: {
              username: true
            }
          },
          category: {
            select: {
              name: true,
              description: true
            }
          }
        }
      })
      return GenericSuccessResponse(undefined, undefined, listing)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new GenericException('Listing not found')
      }
      throw new GenericException()
    }
  }

  async updateListing(listingId: number, userId: number, dto: ListingUpdateDTO): Promise<IGenericSuccessResponse>
  {
    try {
      const listing = await this.prisma.listing.findFirst({
        where: {
          id: listingId,
          userId
        }
      })

      if (!listing) {
        throw new UnauthorizedException()
      }
      
      const updatedListing = await this.prisma.listing.update({
        data: {
          title: dto.title,
          description: dto.description,
          categoryId: dto.categoryId
        },
        where: {
          id: listingId,
        }
      })

      return GenericSuccessResponse(undefined, 'Listing updated', updatedListing)
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new GenericException()
    }
  }

  async deleteListing(listingId: number, userId: number): Promise<IGenericSuccessResponse>
  {
    try {
      const listing = await this.prisma.listing.findFirst({
        where: {
          id: listingId,
          userId
        }
      })

      if (!listing) {
        throw new UnauthorizedException()
      }

      await this.prisma.listing.delete({
        where: {
          id: listingId,
        }
      })

      return GenericSuccessResponse(undefined, 'Listing deleted')
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new GenericException()
    }
  }
}
