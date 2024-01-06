import { Inject, Injectable, PipeTransform, Scope, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GenericException } from "../http/exceptions/generic.exception";
import { Listing } from "@prisma/client";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class ListingModifyPipe implements PipeTransform
{
  constructor(
    @Inject(REQUEST) private request: Request,
    private prismaService: PrismaService
  ) {}

  async transform(value: any): Promise<Listing> {
    if (!this.request.user['id']) {
      console.log('user id not found on request', this.request.user);

      throw new UnauthorizedException();
    }

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

    if (listing.userId !== this.request.user['id']) {
      console.log('incorrect user id');
      
      throw new UnauthorizedException();
    }
    console.log('request user', this.request.user);
    

    return listing;
  }
}
