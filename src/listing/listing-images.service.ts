import { CopyObjectCommand } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { Listing } from "@prisma/client";
import { TemporaryImagesService } from "./temporary-images.service";
import { ConfigService } from "@nestjs/config";
import { S3Service } from "../s3/s3.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ListingImagesService
{
  constructor(
    private temporaryImagesService: TemporaryImagesService,
    private config: ConfigService,
    private prisma: PrismaService,
    private awsS3: S3Service
  ) {}

  async saveImages(listing: Listing): Promise<void>
  {
    const finalBucketImageLocations: string[] = [];

    if (await this.temporaryImagesService.imagesExist(listing.userId)) {
      
      const temporaryImages = await this.temporaryImagesService.getImages(listing.userId);
      const copyCommands = [];

      temporaryImages.Contents.forEach(image => {
        const fileName = image.Key.split('/')[1];
        const fullImageLocationFinal = `listings/${listing.id}/${fileName}`;
        const command = new CopyObjectCommand({
          CopySource: `${this.config.get('AWS_TEMPORARY_USER_LISTING_IMAGES_BUCKET_NAME')}/${image.Key}`,
          Bucket: this.config.get('AWS_BUCKET_NAME'),
          Key: `listings/${listing.id}/${fileName}`
        });

        copyCommands.push(this.awsS3.client().send(command));
        finalBucketImageLocations.push(fullImageLocationFinal);
      })

      await Promise.all(copyCommands);
    }

    if (!finalBucketImageLocations.length) {
      return;
    }

    for (const bucketImageLocation of finalBucketImageLocations) {
      await this.prisma.listingImages.create({
        data: {
          imageLocation: bucketImageLocation,
          listingId: listing.id
        }
      })
    }

    await this.temporaryImagesService.removeImagesByUserId(listing.userId);
  }
}
