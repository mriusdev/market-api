import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ListingModule } from './listing/listing.module';
import { CategoryModule } from './category/category.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
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
