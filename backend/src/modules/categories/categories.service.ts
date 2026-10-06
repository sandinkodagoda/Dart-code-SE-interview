import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { slugify } from '../../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public: List all active categories with count of active products
   */
  async findAllPublic() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });
  }

  /**
   * Public: Get single active category by slug
   */
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!category || !category.isActive) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    return category;
  }

  /**
   * Admin: List all categories with pagination, search, and status filter
   */
  async findAllAdmin(query: CategoryQueryDto): Promise<PaginatedResult<any>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { slug: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.CategoryOrderByWithRelationInput = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [total, data] = await Promise.all([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Get category by ID
   */
  async findByIdAdmin(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    return category;
  }

  /**
   * Admin: Create a new category
   */
  async create(dto: CreateCategoryDto, adminId?: string) {
    const slug = slugify(dto.slug || dto.name);

    const existingSlug = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException(
        `Category with slug '${slug}' already exists. Please choose a unique name or slug.`,
      );
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        imageUrl: dto.imageUrl?.trim(),
        isActive: dto.isActive ?? true,
      },
    });

    // Record audit log
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'CATEGORY_CREATED',
          entityType: 'Category',
          entityId: category.id,
          newValue: category as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.warn('Failed to write audit log for category creation', err);
    }

    return category;
  }

  /**
   * Admin: Update an existing category
   */
  async update(id: string, dto: UpdateCategoryDto, adminId?: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    let slug = category.slug;
    if (dto.slug || dto.name) {
      const candidateSlug = slugify(dto.slug || dto.name || category.name);
      if (candidateSlug !== category.slug) {
        const existingSlug = await this.prisma.category.findUnique({
          where: { slug: candidateSlug },
        });
        if (existingSlug && existingSlug.id !== id) {
          throw new ConflictException(
            `Category with slug '${candidateSlug}' already exists.`,
          );
        }
        slug = candidateSlug;
      }
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : undefined,
        slug: dto.slug !== undefined || dto.name !== undefined ? slug : undefined,
        description:
          dto.description !== undefined ? dto.description?.trim() : undefined,
        imageUrl: dto.imageUrl !== undefined ? dto.imageUrl?.trim() : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
    });

    // Record audit log
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'CATEGORY_UPDATED',
          entityType: 'Category',
          entityId: id,
          previousValue: category as unknown as Prisma.InputJsonValue,
          newValue: updated as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.warn('Failed to write audit log for category update', err);
    }

    return updated;
  }

  /**
   * Admin: Delete category (checks for linked products)
   */
  async remove(id: string, adminId?: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        `Cannot delete category '${category.name}' because it contains ${category._count.products} products. Consider setting isActive to false instead.`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    // Record audit log
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'CATEGORY_DELETED',
          entityType: 'Category',
          entityId: id,
          previousValue: category as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.warn('Failed to write audit log for category deletion', err);
    }

    return { message: `Category '${category.name}' deleted successfully` };
  }
}
