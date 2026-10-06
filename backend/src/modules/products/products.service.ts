import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, InventoryTransactionType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductSearchQueryDto,
  ProductSortOption,
} from './dto/product-search-query.dto';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { AddProductImageDto } from './dto/add-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { slugify } from '../../common/utils/slug.util';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // PHASE 08 & 10: PUBLIC CATALOG & SEARCH
  // ==========================================

  /**
   * Public: Comprehensive search, filter, sort, and pagination
   */
  async searchPublic(query: ProductSearchQueryDto): Promise<PaginatedResult<any>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    // Keyword Search
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
      ];
    }

    // Category Filter (supports either slug or UUID)
    if (query.category) {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          query.category,
        );
      if (isUUID) {
        where.categoryId = query.category;
      } else {
        where.category = { slug: query.category, isActive: true };
      }
    }

    // Brand Filter (supports either slug or UUID)
    if (query.brand) {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          query.brand,
        );
      if (isUUID) {
        where.brandId = query.brand;
      } else {
        where.brand = { slug: query.brand, isActive: true };
      }
    }

    // Price Filter
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(query.minPrice);
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(query.maxPrice);
      }
    }

    // Stock Filter
    if (query.inStock === true) {
      where.stockQuantity = { gt: 0 };
    }

    // Featured Filter
    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (query.sort) {
      case ProductSortOption.PRICE_ASC:
        orderBy = { price: 'asc' };
        break;
      case ProductSortOption.PRICE_DESC:
        orderBy = { price: 'desc' };
        break;
      case ProductSortOption.NAME_ASC:
        orderBy = { name: 'asc' };
        break;
      case ProductSortOption.NEWEST:
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [total, rawProducts] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
          },
        },
      }),
    ]);

    const data = rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      stockQuantity: p.stockQuantity,
      inStock: p.stockQuantity > 0,
      warranty: p.warranty,
      specifications: p.specifications,
      isFeatured: p.isFeatured,
      category: p.category,
      brand: p.brand,
      images: p.images,
      primaryImage: p.images.find((img) => img.isPrimary) || p.images[0] || null,
      createdAt: p.createdAt,
    }));

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
   * Public: Get active featured products
   */
  async findFeaturedPublic(limit = 8) {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: Math.min(20, Math.max(1, limit)),
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
      },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      stockQuantity: p.stockQuantity,
      inStock: p.stockQuantity > 0,
      warranty: p.warranty,
      specifications: p.specifications,
      isFeatured: p.isFeatured,
      category: p.category,
      brand: p.brand,
      images: p.images,
      primaryImage: p.images.find((img) => img.isPrimary) || p.images[0] || null,
      createdAt: p.createdAt,
    }));
  }

  /**
   * Public: Get single active product by slug
   */
  async findPublicBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true, description: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : null,
      stockQuantity: product.stockQuantity,
      inStock: product.stockQuantity > 0,
      warranty: product.warranty,
      specifications: product.specifications,
      isFeatured: product.isFeatured,
      category: product.category,
      brand: product.brand,
      images: product.images,
      primaryImage:
        product.images.find((img) => img.isPrimary) ||
        product.images[0] ||
        null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  // ==========================================
  // PHASE 08: ADMIN PRODUCT MANAGEMENT
  // ==========================================

  /**
   * Admin: List all products (active and inactive) with search and filters
   */
  async findAllAdmin(query: AdminProductQueryDto): Promise<PaginatedResult<any>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          query.category,
        );
      if (isUUID) {
        where.categoryId = query.category;
      } else {
        where.category = { slug: query.category };
      }
    }

    if (query.brand) {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          query.brand,
        );
      if (isUUID) {
        where.brandId = query.brand;
      } else {
        where.brand = { slug: query.brand };
      }
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(query.minPrice);
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(query.maxPrice);
      }
    }

    if (query.inStock === true) {
      where.stockQuantity = { gt: 0 };
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (query.sort) {
      case ProductSortOption.PRICE_ASC:
        orderBy = { price: 'asc' };
        break;
      case ProductSortOption.PRICE_DESC:
        orderBy = { price: 'desc' };
        break;
      case ProductSortOption.NAME_ASC:
        orderBy = { name: 'asc' };
        break;
      case ProductSortOption.NEWEST:
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [total, data] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
          },
          _count: {
            select: {
              inventoryTransactions: true,
              orderItems: true,
            },
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
   * Admin: Get product by ID
   */
  async findAdminById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
        inventoryTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    return product;
  }

  /**
   * Admin: Create product with transactional inventory transaction for initial stock
   */
  async create(dto: CreateProductDto, adminId?: string) {
    // 1. Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException(
        `Category with ID '${dto.categoryId}' does not exist`,
      );
    }

    // 2. Verify brand exists
    const brand = await this.prisma.brand.findUnique({
      where: { id: dto.brandId },
    });
    if (!brand) {
      throw new BadRequestException(
        `Brand with ID '${dto.brandId}' does not exist`,
      );
    }

    // 3. Format SKU and Slug
    const sku = dto.sku.trim().toUpperCase();
    const slug = slugify(dto.slug || dto.name);

    // 4. Verify SKU uniqueness
    const existingSku = await this.prisma.product.findUnique({
      where: { sku },
    });
    if (existingSku) {
      throw new ConflictException(`Product with SKU '${sku}' already exists`);
    }

    // 5. Verify Slug uniqueness
    const existingSlug = await this.prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException(
        `Product with slug '${slug}' already exists. Please provide a distinct name or slug.`,
      );
    }

    const initialStock = dto.stockQuantity || 0;

    // 6. Transactional creation: Product + Images + InventoryTransaction + AuditLog
    const product = await this.prisma.$transaction(async (tx) => {
      // Determine image data
      let imagesData: Prisma.ProductImageCreateWithoutProductInput[] = [];
      if (dto.images && dto.images.length > 0) {
        const hasPrimary = dto.images.some((img) => img.isPrimary);
        imagesData = dto.images.map((img, index) => ({
          imageUrl: img.imageUrl.trim(),
          altText: img.altText?.trim() || null,
          displayOrder: img.displayOrder ?? index,
          isPrimary: hasPrimary ? img.isPrimary ?? false : index === 0,
        }));
      }

      const newProduct = await tx.product.create({
        data: {
          name: dto.name.trim(),
          slug,
          sku,
          description: dto.description.trim(),
          categoryId: dto.categoryId,
          brandId: dto.brandId,
          price: new Prisma.Decimal(dto.price),
          compareAtPrice: dto.compareAtPrice
            ? new Prisma.Decimal(dto.compareAtPrice)
            : null,
          stockQuantity: initialStock,
          warranty: dto.warranty?.trim() || null,
          specifications: (dto.specifications || {}) as Prisma.InputJsonValue,
          isFeatured: dto.isFeatured ?? false,
          isActive: dto.isActive ?? true,
          images:
            imagesData.length > 0
              ? {
                  create: imagesData,
                }
              : undefined,
        },
        include: {
          images: true,
          category: true,
          brand: true,
        },
      });

      // Record initial inventory transaction if stock > 0
      if (initialStock > 0) {
        await tx.inventoryTransaction.create({
          data: {
            productId: newProduct.id,
            type: InventoryTransactionType.STOCK_IN,
            quantity: initialStock,
            previousStock: 0,
            newStock: initialStock,
            reason: 'Initial stock on product creation',
            reference: `PRODUCT_CREATE_${newProduct.id.substring(0, 8)}`,
          },
        });
      }

      // Record audit log
      await tx.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'PRODUCT_CREATED',
          entityType: 'Product',
          entityId: newProduct.id,
          newValue: {
            name: newProduct.name,
            sku: newProduct.sku,
            price: Number(newProduct.price),
            stockQuantity: newProduct.stockQuantity,
          },
        },
      });

      return newProduct;
    });

    return product;
  }

  /**
   * Admin: Update product details (excluding stock, which is managed via inventory operations)
   */
  async update(id: string, dto: UpdateProductDto, adminId?: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    // Verify category if updated
    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(
          `Category with ID '${dto.categoryId}' does not exist`,
        );
      }
    }

    // Verify brand if updated
    if (dto.brandId && dto.brandId !== existing.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
      });
      if (!brand) {
        throw new BadRequestException(
          `Brand with ID '${dto.brandId}' does not exist`,
        );
      }
    }

    // Verify SKU uniqueness if updated
    let sku = existing.sku;
    if (dto.sku) {
      const candidateSku = dto.sku.trim().toUpperCase();
      if (candidateSku !== existing.sku) {
        const conflict = await this.prisma.product.findUnique({
          where: { sku: candidateSku },
        });
        if (conflict && conflict.id !== id) {
          throw new ConflictException(
            `Product with SKU '${candidateSku}' already exists`,
          );
        }
        sku = candidateSku;
      }
    }

    // Verify Slug uniqueness if updated
    let slug = existing.slug;
    if (dto.slug || dto.name) {
      const candidateSlug = slugify(dto.slug || dto.name || existing.name);
      if (candidateSlug !== existing.slug) {
        const conflict = await this.prisma.product.findUnique({
          where: { slug: candidateSlug },
        });
        if (conflict && conflict.id !== id) {
          throw new ConflictException(
            `Product with slug '${candidateSlug}' already exists`,
          );
        }
        slug = candidateSlug;
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.product.update({
        where: { id },
        data: {
          name: dto.name !== undefined ? dto.name.trim() : undefined,
          slug: dto.slug !== undefined || dto.name !== undefined ? slug : undefined,
          sku: dto.sku !== undefined ? sku : undefined,
          description:
            dto.description !== undefined ? dto.description.trim() : undefined,
          categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
          brandId: dto.brandId !== undefined ? dto.brandId : undefined,
          price:
            dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
          compareAtPrice:
            dto.compareAtPrice !== undefined
              ? dto.compareAtPrice === null
                ? null
                : new Prisma.Decimal(dto.compareAtPrice)
              : undefined,
          warranty:
            dto.warranty !== undefined ? dto.warranty?.trim() || null : undefined,
          specifications:
            dto.specifications !== undefined
              ? (dto.specifications as Prisma.InputJsonValue)
              : undefined,
          isFeatured:
            dto.isFeatured !== undefined ? dto.isFeatured : undefined,
          isActive: dto.isActive !== undefined ? dto.isActive : undefined,
        },
        include: {
          category: true,
          brand: true,
          images: true,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'PRODUCT_UPDATED',
          entityType: 'Product',
          entityId: id,
          previousValue: {
            name: existing.name,
            price: Number(existing.price),
            isActive: existing.isActive,
          },
          newValue: {
            name: res.name,
            price: Number(res.price),
            isActive: res.isActive,
          },
        },
      });

      return res;
    });

    return updated;
  }

  /**
   * Admin: Deactivate product (soft-delete)
   */
  async deactivate(id: string, adminId?: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'PRODUCT_DELETED',
          entityType: 'Product',
          entityId: id,
          previousValue: { isActive: true },
          newValue: { isActive: false },
        },
      });
    } catch (err) {
      this.logger.warn('Failed to write audit log for product deactivation', err);
    }

    return { message: `Product '${updated.name}' deactivated successfully` };
  }

  // ==========================================
  // PHASE 09: PRODUCT IMAGE MANAGEMENT
  // ==========================================

  /**
   * Admin: Add image to a product
   */
  async addImage(productId: string, dto: AddProductImageDto, adminId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${productId}' not found`);
    }

    const hasExistingImages = product.images.length > 0;
    const shouldBePrimary = dto.isPrimary || !hasExistingImages;

    const image = await this.prisma.$transaction(async (tx) => {
      if (shouldBePrimary && hasExistingImages) {
        // Demote previous primary images
        await tx.productImage.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const newImage = await tx.productImage.create({
        data: {
          productId,
          imageUrl: dto.imageUrl.trim(),
          altText: dto.altText?.trim() || null,
          displayOrder: dto.displayOrder ?? product.images.length,
          isPrimary: shouldBePrimary,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'PRODUCT_IMAGE_ADDED',
          entityType: 'ProductImage',
          entityId: newImage.id,
          newValue: { productId, imageUrl: newImage.imageUrl, isPrimary: newImage.isPrimary },
        },
      });

      return newImage;
    });

    return image;
  }

  /**
   * Admin: Update product image metadata
   */
  async updateImage(
    productId: string,
    imageId: string,
    dto: UpdateProductImageDto,
    adminId?: string,
  ) {
    const existingImage = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!existingImage) {
      throw new NotFoundException(
        `Image with ID '${imageId}' not found for product '${productId}'`,
      );
    }

    const updatedImage = await this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary === true && !existingImage.isPrimary) {
        await tx.productImage.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const res = await tx.productImage.update({
        where: { id: imageId },
        data: {
          imageUrl: dto.imageUrl !== undefined ? dto.imageUrl.trim() : undefined,
          altText:
            dto.altText !== undefined ? dto.altText?.trim() || null : undefined,
          displayOrder:
            dto.displayOrder !== undefined ? dto.displayOrder : undefined,
          isPrimary: dto.isPrimary !== undefined ? dto.isPrimary : undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'PRODUCT_IMAGE_UPDATED',
          entityType: 'ProductImage',
          entityId: imageId,
          previousValue: existingImage as unknown as Prisma.InputJsonValue,
          newValue: res as unknown as Prisma.InputJsonValue,
        },
      });

      return res;
    });

    return updatedImage;
  }

  /**
   * Admin: Set image as primary hero image
   */
  async setPrimaryImage(productId: string, imageId: string, adminId?: string) {
    return this.updateImage(productId, imageId, { isPrimary: true }, adminId);
  }

  /**
   * Admin: Delete product image
   */
  async deleteImage(productId: string, imageId: string, adminId?: string) {
    const existingImage = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!existingImage) {
      throw new NotFoundException(
        `Image with ID '${imageId}' not found for product '${productId}'`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.productImage.delete({
        where: { id: imageId },
      });

      // If the deleted image was primary, elevate the remaining image with lowest displayOrder
      if (existingImage.isPrimary) {
        const nextPrimary = await tx.productImage.findFirst({
          where: { productId },
          orderBy: { displayOrder: 'asc' },
        });

        if (nextPrimary) {
          await tx.productImage.update({
            where: { id: nextPrimary.id },
            data: { isPrimary: true },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'PRODUCT_IMAGE_DELETED',
          entityType: 'ProductImage',
          entityId: imageId,
          previousValue: existingImage as unknown as Prisma.InputJsonValue,
        },
      });
    });

    return { message: 'Product image deleted successfully' };
  }
}
