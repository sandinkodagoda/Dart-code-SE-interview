import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductSearchQueryDto } from './dto/product-search-query.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Search, filter, and browse products catalog',
    description:
      'Public endpoint to search and filter active products with multi-attribute filtering (category, brand, price range, stock availability), dynamic sorting (newest, price, name), and structured pagination.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated product catalog matching search criteria',
  })
  async search(@Query() query: ProductSearchQueryDto) {
    return this.productsService.searchPublic(query);
  }

  @Get('featured')
  @ApiOperation({
    summary: 'List featured products',
    description:
      'Public endpoint to retrieve high-visibility featured products for homepage highlights and promos.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of featured products',
  })
  async getFeatured() {
    return this.productsService.findFeaturedPublic();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get product details by slug',
    description:
      'Public endpoint to retrieve complete product information, brand, category, specifications, stock availability, and gallery images.',
  })
  @ApiParam({
    name: 'slug',
    description: 'URL-friendly product slug (e.g. apple-iphone-15-pro-max-256gb)',
    example: 'apple-iphone-15-pro-max-256gb',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product details retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found or inactive',
  })
  async findOne(@Param('slug') slug: string) {
    return this.productsService.findPublicBySlug(slug);
  }
}
