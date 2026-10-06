import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BrandsService } from './brands.service';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({
    summary: 'List active product brands',
    description:
      'Public endpoint to fetch all active brands, sorted alphabetically, along with count of active products.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active brands retrieved successfully',
  })
  async findAll() {
    return this.brandsService.findAllPublic();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get active brand by slug',
    description:
      'Public endpoint to fetch a single active brand by its unique URL slug.',
  })
  @ApiParam({
    name: 'slug',
    description: 'URL-friendly brand slug (e.g. apple)',
    example: 'apple',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Brand found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Brand not found or inactive',
  })
  async findOne(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }
}
