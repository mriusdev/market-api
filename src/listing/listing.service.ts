import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { NotFoundError } from '@prisma/client/runtime';
import { Request } from 'express';
import { GenericException } from '../common/helpers/exceptions';
import { GenericSuccessResponse } from '../common/helpers/responses';
import { IGenericSuccessResponse } from '../common/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { ListingCreateDTO, ListingUpdateDTO } from './dto';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ListingService {
  constructor(private prisma: PrismaService, private config: ConfigService, private httpService: HttpService) {}

  async createListing(dto: ListingCreateDTO, userId: number): Promise<IGenericSuccessResponse> {
    try {
      await this.prisma.listing.create({
        data: {
          title: dto.title,
          price: dto.price,
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
          price: dto.price,
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

  async uploadListingImages(id: number, req: Request, files: Array<Express.Multer.File>)
  {
    console.log('file info', files);
    const s3Client = new S3Client({
      region: this.config.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.config.get('AWS_SECRET_KEY')
      }
    })
    const arrayOfFilesToBeUploaded = [];
    // throw Error('lel')
    for (const file of files) {
      const params = {
        Bucket: this.config.get('AWS_BUCKET_NAME'),
        Key: `listings/${id}/${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
      }
      const command = new PutObjectCommand(params)
      arrayOfFilesToBeUploaded.push(s3Client.send(command))
    }

    console.log('arrayOfFiles', arrayOfFilesToBeUploaded);
    try {
      const result = await Promise.all(arrayOfFilesToBeUploaded)
      return GenericSuccessResponse(undefined, 'Image upload success', result)
    } catch (error) {
      return {
        msg: 'failed',
        error
      }
    }
    return;

    // console.log('req info',req);
    let file;
    
    // const s3Client = new S3Client({
    //   region: this.config.get('AWS_REGION'),
    //   credentials: {
    //     accessKeyId: null,
    //     secretAccessKey: null
    //   }
    // })

    const params = {
      Bucket: this.config.get('AWS_BUCKET_NAME'),
      Key: `listings/${id}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype
    }
    const command = new PutObjectCommand(params)
    try {
      await s3Client.send(command)
      return GenericSuccessResponse(undefined, 'Image upload success', {})
      
    } catch (error) {
      return {
        msg: 'failed',
        error
      }
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
