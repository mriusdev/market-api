import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { S3Module } from '../s3/s3.module';
import { TemporaryImagesService } from './temporary-images.service';
import { ListingPipe } from '../common/pipes/listing.pipe';
import { ListingImagesService } from './listing-images.service';

@Module({
  imports: [HttpModule, S3Module],
  exports: [ListingService],
  controllers: [ListingController],
  providers: [ListingService, TemporaryImagesService, ListingPipe, ListingImagesService]
})
export class ListingModule {}
