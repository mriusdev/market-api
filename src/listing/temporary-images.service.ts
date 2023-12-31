import { Injectable } from "@nestjs/common";
import { S3Service } from "../s3/s3.service";
import { DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, ListObjectsV2Command, ListObjectsV2CommandOutput, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { MaximumImagesException } from "../common/http/exceptions/temporary-images/maximum-images.exception";
import { GenericException } from "../common/http/exceptions/generic.exception";

@Injectable()
export class TemporaryImagesService
{
  private maximumImagesCount: number = 3;
  private temporaryImagesS3BucketName: string;

  constructor(private config: ConfigService, private awsS3: S3Service) {
    this.temporaryImagesS3BucketName = this.config.get('AWS_TEMPORARY_USER_LISTING_IMAGES_BUCKET_NAME')
  }

  async saveImages(userId: number, images: Express.Multer.File[]): Promise<boolean>
  {
    await this.validateImages(images, userId);

    const s3SaveImageCalls = [];
    for (const image of images) {
      const command = new PutObjectCommand({
        Bucket: this.temporaryImagesS3BucketName,
        Key: `${userId}/${image.originalname}`,
        Body: image.buffer,
        ContentType: image.mimetype
      });
      s3SaveImageCalls.push(this.awsS3.client().send(command));
    }

    await Promise.all(s3SaveImageCalls);

    return true;
  }

  async imagesExist(userId: number): Promise<boolean>
  {
    const command = new ListObjectsV2Command({
      Bucket: this.temporaryImagesS3BucketName,
      Prefix: `${userId}/`,
      MaxKeys: 1,
    })
    const data = await this.awsS3.client().send(command);
    // console.log('images exist data', data, 'return value', !!data?.KeyCount);
    // throw new GenericException('aaaaaa');
    return !!data?.KeyCount;
  }

  async getImages(userId: number): Promise<ListObjectsV2CommandOutput>
  {
    const command = new ListObjectsV2Command({
      Bucket: this.temporaryImagesS3BucketName,
      Prefix: `${userId}/`,
      MaxKeys: this.maximumImagesCount,
    })
    const data = await this.awsS3.client().send(command);

    return data;
  }

  async removeImagesByUserId(userId: number): Promise<boolean>
  {
    const images = await this.getImages(userId);
    const deleteImageCommands = [];

    images.Contents.forEach(image => {
      const command = new DeleteObjectCommand({
        Bucket: this.temporaryImagesS3BucketName,
        Key: image.Key
      })
      deleteImageCommands.push(this.awsS3.client().send(command));
    })

    await Promise.all(deleteImageCommands);
    
    return true;
  }

  async validateImages(images: Express.Multer.File[], userId: number): Promise<void>
  {
    if (images.length > this.maximumImagesCount) {
      throw new MaximumImagesException(); 
    }

    const uploadedImages = await this.getImages(userId);
    if (uploadedImages?.KeyCount === this.maximumImagesCount) {
      throw new MaximumImagesException();
    }
  }
}
