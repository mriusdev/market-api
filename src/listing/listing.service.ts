import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Decimal, NotFoundError } from '@prisma/client/runtime';
import { GenericException } from '../common/http/exceptions/generic.exception';
import { PrismaService } from '../prisma/prisma.service';
import { ListingCreateDTO, ListingFilterDTO, ListingUpdateDTO } from './dto';
import { IListingSearchBuilderResult, ListingSearchBuilder } from './listing-search-builder.service';
import { Listing } from '@prisma/client';
import { ListingImagesService } from './listing-images.service';
import { ListingUpdateService } from './listing-update.service';

export interface IGetListingData {
  id: number;
  createdAt: Date;
  title: string;
  price: Decimal;
  description: string;
  author: {
      username: string;
  };
  category: {
      description: string;
      name: string;
  };
  listingImages: {
      id: number;
      imageLocation: string;
  }[];
}

@Injectable()
export class ListingService {

  constructor(
    private prisma: PrismaService,
    private listingImagesService: ListingImagesService,
    private listingUpdateService: ListingUpdateService
  ) {}

  async createListing(dto: ListingCreateDTO, userId: number): Promise<Listing> {
    try {
      const listing = await this.prisma.listing.create({
        data: {
          title: dto.title,
          price: dto.price,
          description: dto.description,
          categoryId: +dto.category,
          userId: userId
        }
      })

      await this.listingImagesService.saveImages(listing);

      return listing;
    } catch (error) {
      throw new GenericException(error);
    }
  }

  async getListings(filterDTO: ListingFilterDTO): Promise<IListingSearchBuilderResult>
  {
    try {
      return (new ListingSearchBuilder(this.prisma))
        .setDTO(filterDTO)
        .getCategory()
        .getPage()
        .getSearch()
        .getPaginatedResult();
    } catch (error) {
      throw new GenericException(error)
    }
  }

  async getListing(id: number): Promise<IGetListingData>
  {
    try {
      const listing = await this.prisma.listing.findFirstOrThrow({
        where: {
          id
        },
        select: {
          id: true,
          price: true,
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
          },
          listingImages: {
            select: {
              id: true,
              imageLocation: true
            },
          }
        }
      })

      return listing;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new GenericException('Listing not found')
      }
      throw new GenericException()
    }
  }

  async updateListing(listing: Listing, dto: ListingUpdateDTO): Promise<string>
  {
    await this.listingUpdateService
      .setValues(dto, listing)
      .handleUpdates();

    return 'Listing updated';
  }

  async deleteListing(listing: Listing, userId: number): Promise<string>
  {
    try {
      // const listing = await this.prisma.listing.findFirst({
      //   where: {
      //     id: listingId,
      //     userId
      //   }
      // })

      // if (!listing) {
      //   throw new UnauthorizedException()
      // }


      // TODO: before removing listing, first remove related s3 files and then delete references to those files in db
      // await this.prisma.listing.delete({
      //   where: {
      //     id: listingId,
      //   }
      // })

      // return GenericSuccessResponse(undefined, 'Listing deleted')
      return 'Listing rmoval in progress'
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new GenericException()
    }
  }
}
