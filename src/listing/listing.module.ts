import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { ListingSearchBuilder } from './listingSearchBuilder.service';
import { S3Module } from '../s3/s3.module';
import { listingImagesService } from './listingImages.service';

@Module({
  imports: [HttpModule, S3Module],
  exports: [ListingService],
  controllers: [ListingController],
  providers: [ListingService, listingImagesService]
})
export class ListingModule {}
