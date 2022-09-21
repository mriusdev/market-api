import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ListingModule } from './listing/listing.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [AuthModule, UserModule, ListingModule, CategoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
