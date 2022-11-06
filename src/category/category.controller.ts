import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ICategories } from './interfaces';

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
