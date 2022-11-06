import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICategories } from './interfaces';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getCategories(): Promise<ICategories[]> {
    return await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        iconClass: true
      }
    });
  }
}
