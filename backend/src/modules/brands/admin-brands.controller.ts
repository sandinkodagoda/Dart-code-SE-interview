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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/brand-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin - Brands')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
@Controller('admin/brands')
export class AdminBrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all brands (Admin)',
    description:
      'Retrieves a paginated list of brands for the admin portal, supporting search, isActive filtering, and sorting.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated brands list',
  })
  async findAll(@Query() query: BrandQueryDto) {
    return this.brandsService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get brand by ID (Admin)',
    description: 'Retrieves a single brand by its internal UUID.',
  })
  @ApiParam({ name: 'id', description: 'Brand UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Brand found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Brand not found',
  })
  async findOne(@Param('id') id: string) {
    return this.brandsService.findByIdAdmin(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new brand (Admin)',
    description:
      'Creates a brand with a unique slug. If slug is not provided, it is automatically derived from the name.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Brand created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Brand slug already in use',
  })
  async create(
    @Body() dto: CreateBrandDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.brandsService.create(dto, adminId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update brand (Admin)',
    description: 'Updates brand properties and ensures slug uniqueness.',
  })
  @ApiParam({ name: 'id', description: 'Brand UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Brand updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Brand not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Brand slug already in use',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.brandsService.update(id, dto, adminId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete brand (Admin)',
    description:
      'Deletes a brand if it has no associated products. If products exist, returns a 400 Bad Request error.',
  })
  @ApiParam({ name: 'id', description: 'Brand UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Brand deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete brand containing associated products',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Brand not found',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.brandsService.remove(id, adminId);
  }
}
