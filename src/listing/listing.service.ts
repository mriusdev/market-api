import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { NotFoundError } from '@prisma/client/runtime';
import { GenericException } from '../common/http/exceptions/generic.exception';
import { GenericSuccessResponse } from '../common/helpers/responses';
import { IGenericSuccessResponse } from '../common/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { ListingCreateDTO, ListingFilterDTO, ListingImagesDeleteDTO, ListingImagesUpdateDTO, ListingUpdateDTO } from './dto';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { ConfigService } from '@nestjs/config';
import { IListingSearchBuilderResult, ListingSearchBuilder } from './listing-search-builder.service';
import { S3Service } from '../s3/s3.service';
import { TemporaryImagesService } from './temporary-images.service';

@Injectable()
export class ListingService {
  private s3Client: S3Client
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private temporaryImagesService: TemporaryImagesService,
    s3Service: S3Service
  )
  {
    this.s3Client = s3Service.client();
  }

  async createListing(dto: ListingCreateDTO, userId: number): Promise<boolean> {
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
      const finalBucketImageLocations: string[] = [];

      if (this.temporaryImagesService.imagesExist(userId)) {
        const temporaryImages = await this.temporaryImagesService.getImages(userId);
        const copyCommands = [];

        temporaryImages.Contents.forEach(image => {
          const fileName = image.Key.split('/')[1];
          const fullImageLocationFinal = `listings/${listing.id}/${fileName}`;
          const command = new CopyObjectCommand({
            CopySource: `${this.config.get('AWS_TEMPORARY_USER_LISTING_IMAGES_BUCKET_NAME')}/${image.Key}`,
            Bucket: this.config.get('AWS_BUCKET_NAME'),
            Key: `listings/${listing.id}/${fileName}`
          });

          copyCommands.push(this.s3Client.send(command));
          finalBucketImageLocations.push(fullImageLocationFinal);
        })

        await Promise.all(copyCommands);
      }

      for (const bucketImageLocation of finalBucketImageLocations) {
        await this.prisma.listingImages.create({
          data: {
            imageLocation: bucketImageLocation,
            listingId: listing.id
          }
        })
      }

      await this.temporaryImagesService.removeImagesByUserId(userId);

      return true;
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
          },
          listingImages: {
            select: {
              id: true,
              imageLocation: true
            },
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

  //TODO: rethink this methods usefulness. Logic could be used for listing creation during
  // image upload
  async uploadListingImages(id: number, userId: number, files: Array<Express.Multer.File>): Promise<IGenericSuccessResponse>
  {
    try {
      const listing = await this.prisma.listing.findFirst({
        where: {
          id,
          userId
        }
      })
  
      if (!listing) {
        throw new UnauthorizedException()
      }

      const arrayOfFilesToBeUploaded = [];
      const fileLocations = [];
      
      for (const file of files) {
        const fullFileLocation = `listings/${id}/${file.originalname}`
        const params = {
          Bucket: this.config.get('AWS_BUCKET_NAME'),
          Key: fullFileLocation,
          Body: file.buffer,
          ContentType: file.mimetype
        }
        const command = new PutObjectCommand(params)
        arrayOfFilesToBeUploaded.push(this.s3Client.send(command))
        fileLocations.push(fullFileLocation)
      }

      await Promise.all(arrayOfFilesToBeUploaded)
      for (const fileLocation of fileLocations) {
        await this.prisma.listingImages.create({
          data: {
            imageLocation: fileLocation,
            listingId: id
          }
        })
      }
      return GenericSuccessResponse(undefined, 'Image upload success', {})
    } catch (error) {
      throw new GenericException(error)
    }
  }

  //TODO refactor repeating 'findIfExists' s3 code
  async updateListingImages(id: number, userId: number, file: Express.Multer.File, dto: ListingImagesUpdateDTO)
  {
    try {
      const listing = await this.prisma.listing.findFirst({
        where: {
          id,
          userId
        }
      })
  
      if (!listing) {
        throw new UnauthorizedException()
      }

      const headObjectCommandParams = {
        Bucket: this.config.get('AWS_BUCKET_NAME'),
        Key: dto.path,
      }
      const headObjectCommand = new HeadObjectCommand(headObjectCommandParams)
      const currentImage = await this.s3Client.send(headObjectCommand)
      if (!currentImage) {
        throw new UnauthorizedException()
      }

      const newFullFileLocation = `listings/${id}/${file.originalname}`
      const putObjectCommandParams = {
        Bucket: this.config.get('AWS_BUCKET_NAME'),
        Key: newFullFileLocation,
        Body: file.buffer,
        ContentType: file.mimetype
      }
      const putObjectCommand = new PutObjectCommand(putObjectCommandParams)
      await this.s3Client.send(putObjectCommand)

      const deleteObjectCommandParams = {
        Bucket: this.config.get('AWS_BUCKET_NAME'),
        Key: dto.path,
      }
      const deleteObjectCommand = new DeleteObjectCommand(deleteObjectCommandParams)
      await this.s3Client.send(deleteObjectCommand)

      const updatedImage = await this.prisma.listingImages.update({
        where: {
          id: +dto.id
        },
        data: {
          imageLocation: newFullFileLocation
        }
      })
      
      return GenericSuccessResponse(undefined, 'Image upload success', updatedImage)
    } catch (error) {
      throw new GenericException(error)
    }
  }

  async deleteListingImages(id: number, userId: number, dto: ListingImagesDeleteDTO): Promise<IGenericSuccessResponse>
  {
    try {
      const listing = await this.prisma.listing.findFirst({
        where: {
          id,
          userId
        }
      })
  
      if (!listing) {
        throw new UnauthorizedException()
      }

      for (const imageInfo of dto.imageDetails) {

        const splitUrl = imageInfo.imagePath.split("/")
        if (+splitUrl[1] !== id) {
          throw new UnauthorizedException()
        }
  
        const params = {
          Bucket: this.config.get('AWS_BUCKET_NAME'),
          Key: imageInfo.imagePath,
        }
  
        const command = new DeleteObjectCommand(params)
        await this.s3Client.send(command)
        await this.prisma.listingImages.delete({
          where: {
            id: +imageInfo.id
          }
        })
      }
      return GenericSuccessResponse(undefined, 'Image(s) successfully removed', {})
    } catch (error) {
      throw new GenericException(error)
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
