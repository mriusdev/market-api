import { Injectable } from "@nestjs/common";
import { S3Service } from "../s3/s3.service";
import { DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, ListObjectsV2Command, ListObjectsV2CommandOutput, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class listingImagesService {

  private temporaryImagesS3BucketName: string;

  private s3Client: S3Client;

  constructor(private config: ConfigService, s3Service: S3Service) {
    this.s3Client = s3Service.client();
    this.temporaryImagesS3BucketName = this.config.get('AWS_TEMPORARY_USER_LISTING_IMAGES_BUCKET_NAME')
  }

  async saveTemporaryImages(userId: number, image: Express.Multer.File): Promise<boolean>
  {
    console.log('user id received', userId);
    const fullFileLocation = `${userId}/${image.originalname}`
    const command = new PutObjectCommand({
      Bucket: this.temporaryImagesS3BucketName,
      Key: fullFileLocation,
      Body: image.buffer,
      ContentType: image.mimetype
    })
    const data = await this.s3Client.send(command);
    console.log('data from upload command', data);

    return true;
  }

  async temporaryImagesExist(userId: number): Promise<boolean>
  {
    // if images are found return Boolean, if not returen false
    console.log('user id received', userId);
    const command = new ListObjectsV2Command({
      Bucket: this.temporaryImagesS3BucketName,
      Prefix: `${userId}/`,
      MaxKeys: 1,
    })
    const data = await this.s3Client.send(command);
    console.log('data from list command', data);

    return !!data?.KeyCount;
  }

  async getImages(userId: number): Promise<ListObjectsV2CommandOutput>
  {
    const command = new ListObjectsV2Command({
      Bucket: this.temporaryImagesS3BucketName,
      Prefix: `${userId}/`,
      MaxKeys: 3,
    })
    const data = await this.s3Client.send(command);
    return data;
  }

  copyTemporaryImagesToListingImages(listingId: number): void
  {
    // foreach full image path (only the file path, not including the aws url)

    // foreach found file
      // COPY file to actual listing BY id directory
  }

  async removeTemporaryImages(userId: number): Promise<boolean>
  {
    const images = await this.getImages(userId);

    // images.forEach(image => {

    // })

    const deleteImageCommands = [];

    images.Contents.forEach(image => {
      const command = new DeleteObjectCommand({
        Bucket: this.temporaryImagesS3BucketName,
        Key: image.Key,
        // Key: `${this.temporaryImagesS3BucketName}/${userId}/`,
      })
      // const data = await this.s3Client.send(command);
      deleteImageCommands.push(this.s3Client.send(command));
    })

    await Promise.all(deleteImageCommands);
    
    // console.log('delete data', data);
    
    return true;
    // removes folder containing user imagges by user id
  }
}
