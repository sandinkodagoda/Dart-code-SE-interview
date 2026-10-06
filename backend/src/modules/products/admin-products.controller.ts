import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { AddProductImageDto } from './dto/add-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin - Products')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ==========================================
  // PRODUCT MANAGEMENT
  // ==========================================

  @Get()
  @ApiOperation({
    summary: 'List products (Admin)',
    description:
      'Retrieves a paginated list of all products including active/inactive status, stock levels, and associated categories/brands.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated admin products list',
  })
  async findAll(@Query() query: AdminProductQueryDto) {
    return this.productsService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID (Admin)',
    description:
      'Retrieves complete administrative details of a product including full image gallery and inventory transaction history.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async findOne(@Param('id') id: string) {
    return this.productsService.findAdminById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new product (Admin)',
    description:
      'Creates a product, uploads initial gallery images, and records an initial inventory transaction in a single database transaction.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid category or brand',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'SKU or slug already in use',
  })
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.productsService.create(dto, adminId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update product (Admin)',
    description:
      'Updates product metadata, pricing, description, and specifications while enforcing SKU and slug uniqueness.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'SKU or slug collision',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.productsService.update(id, dto, adminId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate product (Admin soft-delete)',
    description:
      'Deactivates a product so it is hidden from the public store, preserving order history and inventory audit trails.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product deactivated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.productsService.deactivate(id, adminId);
  }

  // ==========================================
  // PRODUCT IMAGE MANAGEMENT (PHASE 09)
  // ==========================================

  @Post(':id/images')
  @ApiOperation({
    summary: 'Add an image to product (Admin)',
    description:
      'Adds a gallery image to a product. If marked as primary, unsets previous primary images.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Image added successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async addImage(
    @Param('id') productId: string,
    @Body() dto: AddProductImageDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.productsService.addImage(productId, dto, adminId);
  }

  @Patch(':id/images/:imageId')
  @ApiOperation({
    summary: 'Update product image (Admin)',
    description:
      'Updates image alt text, display order, or primary status.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiParam({ name: 'imageId', description: 'Image UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Image not found for this product',
  })
  async updateImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateProductImageDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.productsService.updateImage(productId, imageId, dto, adminId);
  }

  @Patch(':id/images/:imageId/primary')
  @ApiOperation({
    summary: 'Set image as primary hero image (Admin)',
    description:
      'Designates this image as the primary image for the product card and unsets any previous primary image.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiParam({ name: 'imageId', description: 'Image UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image set as primary',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Image not found for this product',
  })
  async setPrimaryImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.productsService.setPrimaryImage(productId, imageId, adminId);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete product image (Admin)',
    description:
      'Removes an image from a product. If it was primary, the next available image is promoted to primary.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiParam({ name: 'imageId', description: 'Image UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Image not found for this product',
  })
  async deleteImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.productsService.deleteImage(productId, imageId, adminId);
  }
}
