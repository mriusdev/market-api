import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ListingModule } from './listing/listing.module';
import { CategoryModule } from './category/category.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    AuthModule,
    S3Module,
    UserModule,
    ListingModule,
    CategoryModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
