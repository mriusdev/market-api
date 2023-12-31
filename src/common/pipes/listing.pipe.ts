import { Injectable, PipeTransform } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GenericException } from "../http/exceptions/generic.exception";
import { Listing } from "@prisma/client";

@Injectable()
export class ListingPipe implements PipeTransform
{
  constructor(private prismaService: PrismaService) {}

  async transform(value: any): Promise<Listing> {
    const listingId = parseInt(value);
    if (!listingId || !Number.isInteger(listingId)) {
      throw new GenericException('Invalid parameter');
    }

    const listing = await this.prismaService.listing.findFirstOrThrow({
      where: {
        id: listingId,
      },
      include: {
        listingImages: true
      }
    }).catch(() => {
      throw new GenericException('Could not find listing')
    });

    return listing;
  }
}
