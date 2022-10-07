import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';

@Module({
  exports: [ListingService],
  controllers: [ListingController],
  providers: [ListingService]
})
export class ListingModule {}
