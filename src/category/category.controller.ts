import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthAccessGuard } from '../auth/guard';
import { CategoryService } from './category.service';
import { ICategories } from './interfaces';

@UseGuards(JwtAuthAccessGuard)
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  getCategories(): Promise<ICategories[]>
  {
    return this.categoryService.getCategories();
  }
}
