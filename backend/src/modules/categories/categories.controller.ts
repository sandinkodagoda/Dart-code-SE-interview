import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'List active product categories',
    description:
      'Public endpoint to fetch all active categories, sorted alphabetically, along with count of active products.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active categories retrieved successfully',
  })
  async findAll() {
    return this.categoriesService.findAllPublic();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get active category by slug',
    description:
      'Public endpoint to fetch a single active category by its unique URL slug.',
  })
  @ApiParam({
    name: 'slug',
    description: 'URL-friendly category slug (e.g. mobile-phones)',
    example: 'mobile-phones',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found or inactive',
  })
  async findOne(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
