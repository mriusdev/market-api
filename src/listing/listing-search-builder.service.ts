import { ListingFilterDTO } from "./dto";
import { PrismaService } from "../prisma/prisma.service";

export interface IListingSearchBuilderResult
{
  metadata?: Object
  data: any
}

export class ListingSearchBuilder
{
  private static readonly DEFAULT_PER_PAGE: number = 2;
  private static readonly DEFAULT_IMAGE_COUNT: number = 1;

  private listingSearchDTO: ListingFilterDTO;
  private page: number;
  private whereQuery: {} = {};
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  setDTO(dto: ListingFilterDTO): ListingSearchBuilder
  {
    this.listingSearchDTO = dto;
    return this;
  }

  getCategory(): ListingSearchBuilder
  {
    const category = this.listingSearchDTO.category;
    if (!category || this.whereQuery.hasOwnProperty('category')) {
      return this;
    }

    this.whereQuery = {
      ...this.whereQuery,
      category: {
        id: category
      }
    }
    return this;
  }

  getPage(): ListingSearchBuilder
  {
    const page = this.listingSearchDTO.page;
    if (!page) {
      return this;
    }

    this.page = page;
    return this;
  }

  getSearch(): ListingSearchBuilder
  {
    const search = this.listingSearchDTO.search;
    if (!search || this.whereQuery.hasOwnProperty('title')) {
      return this;
    }

    this.whereQuery = {
      ...this.whereQuery,
      title: {
        contains: search
      }
    }
    return this;
  }

  async getPaginatedResult(): Promise<IListingSearchBuilderResult>
  {
    const listingsCountPromise = this.prisma.listing.count({
      where: {
        ...this.whereQuery
      }
    })

    const listingsPromise = this.prisma.listing.findMany({
      take: ListingSearchBuilder.DEFAULT_PER_PAGE,
      skip: this.page === 1 ? 0 : (this.page - 1) * ListingSearchBuilder.DEFAULT_PER_PAGE,
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
            id: true,
            name: true,
            description: true,
            iconClass: true
          }
        },
        listingImages: {
          take: ListingSearchBuilder.DEFAULT_IMAGE_COUNT,
          select: {
            id: true,
            imageLocation: true
          },
        }
      },
      where: {
        ...this.whereQuery
      }
    })
    const [listingsCount, listings] = await Promise.all([listingsCountPromise, listingsPromise]);
    
    const totalPages = Math.ceil(listingsCount / ListingSearchBuilder.DEFAULT_PER_PAGE);
    
    return {
      metadata: {
        totalPages: totalPages,
        currentPage: this.page,
        previousPage: this.page === 1 ? false : true,
        nextPage: this.page < totalPages ? true : false,
      },
      data: listings
    }
  }

}
