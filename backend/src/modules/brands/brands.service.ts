import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/brand-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { slugify } from '../../common/utils/slug.util';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public: List all active brands with count of active products
   */
  async findAllPublic() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
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
   * Public: Get single active brand by slug
   */
  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
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

    if (!brand || !brand.isActive) {
      throw new NotFoundException(`Brand with slug '${slug}' not found`);
    }

    return brand;
  }

  /**
   * Admin: List all brands with pagination, search, and status filter
   */
  async findAllAdmin(query: BrandQueryDto): Promise<PaginatedResult<any>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.BrandWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { slug: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.BrandOrderByWithRelationInput = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [total, data] = await Promise.all([
      this.prisma.brand.count({ where }),
      this.prisma.brand.findMany({
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
   * Admin: Get brand by ID
   */
  async findByIdAdmin(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID '${id}' not found`);
    }

    return brand;
  }

  /**
   * Admin: Create a new brand
   */
  async create(dto: CreateBrandDto, adminId?: string) {
    const slug = slugify(dto.slug || dto.name);

    const existingSlug = await this.prisma.brand.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException(
        `Brand with slug '${slug}' already exists. Please choose a unique name or slug.`,
      );
    }

    const brand = await this.prisma.brand.create({
      data: {
        name: dto.name.trim(),
        slug,
        logoUrl: dto.logoUrl?.trim(),
        isActive: dto.isActive ?? true,
      },
    });

    // Record audit log
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'BRAND_CREATED',
          entityType: 'Brand',
          entityId: brand.id,
          newValue: brand as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.warn('Failed to write audit log for brand creation', err);
    }

    return brand;
  }

  /**
   * Admin: Update an existing brand
   */
  async update(id: string, dto: UpdateBrandDto, adminId?: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID '${id}' not found`);
    }

    let slug = brand.slug;
    if (dto.slug || dto.name) {
      const candidateSlug = slugify(dto.slug || dto.name || brand.name);
      if (candidateSlug !== brand.slug) {
        const existingSlug = await this.prisma.brand.findUnique({
          where: { slug: candidateSlug },
        });
        if (existingSlug && existingSlug.id !== id) {
          throw new ConflictException(
            `Brand with slug '${candidateSlug}' already exists.`,
          );
        }
        slug = candidateSlug;
      }
    }

    const updated = await this.prisma.brand.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : undefined,
        slug: dto.slug !== undefined || dto.name !== undefined ? slug : undefined,
        logoUrl: dto.logoUrl !== undefined ? dto.logoUrl?.trim() : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
    });

    // Record audit log
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'BRAND_UPDATED',
          entityType: 'Brand',
          entityId: id,
          previousValue: brand as unknown as Prisma.InputJsonValue,
          newValue: updated as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.warn('Failed to write audit log for brand update', err);
    }

    return updated;
  }

  /**
   * Admin: Delete brand (checks for linked products)
   */
  async remove(id: string, adminId?: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID '${id}' not found`);
    }

    if (brand._count.products > 0) {
      throw new BadRequestException(
        `Cannot delete brand '${brand.name}' because it contains ${brand._count.products} products. Consider setting isActive to false instead.`,
      );
    }

    await this.prisma.brand.delete({
      where: { id },
    });

    // Record audit log
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'BRAND_DELETED',
          entityType: 'Brand',
          entityId: id,
          previousValue: brand as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.warn('Failed to write audit log for brand deletion', err);
    }

    return { message: `Brand '${brand.name}' deleted successfully` };
  }
}
