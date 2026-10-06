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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin - Categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all categories (Admin)',
    description:
      'Retrieves a paginated list of categories for the admin portal, supporting search, isActive filtering, and sorting.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated categories list',
  })
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID (Admin)',
    description: 'Retrieves a single category by its internal UUID.',
  })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findByIdAdmin(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new category (Admin)',
    description:
      'Creates a category with a unique slug. If slug is not provided, it is automatically derived from the name.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category slug already in use',
  })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.categoriesService.create(dto, adminId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update category (Admin)',
    description: 'Updates category properties and ensures slug uniqueness.',
  })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category slug already in use',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.categoriesService.update(id, dto, adminId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete category (Admin)',
    description:
      'Deletes a category if it has no associated products. If products exist, returns a 400 Bad Request error.',
  })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete category containing associated products',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.categoriesService.remove(id, adminId);
  }
}
