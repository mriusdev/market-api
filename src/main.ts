import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.enableCors({
    credentials: true,
    origin: 'http://127.0.0.1:5173'
  })
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));
  await app.listen(3000);
}
bootstrap();
