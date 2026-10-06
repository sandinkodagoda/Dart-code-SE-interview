import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Admin: Adjust inventory stock with atomic transaction and audit log
   */
  async adjustStock(dto: AdjustStockDto, adminId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${dto.productId}' not found`);
    }

    const previousStock = product.stockQuantity;
    const newStock = previousStock + dto.quantity;

    if (newStock < 0) {
      throw new BadRequestException(
        `Cannot reduce stock below 0. Product '${product.name}' currently has ${previousStock} in stock, but adjustment requested was ${dto.quantity}.`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update product stock quantity
      const updatedProduct = await tx.product.update({
        where: { id: dto.productId },
        data: { stockQuantity: newStock },
      });

      // 2. Create traceable inventory transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId: dto.productId,
          type: dto.type,
          quantity: Math.abs(dto.quantity),
          previousStock,
          newStock,
          reason: dto.reason?.trim() || null,
          reference: dto.reference?.trim() || null,
        },
      });

      // 3. Record administrative audit log
      await tx.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'INVENTORY_ADJUSTED',
          entityType: 'Product',
          entityId: dto.productId,
          previousValue: { stockQuantity: previousStock },
          newValue: {
            stockQuantity: newStock,
            delta: dto.quantity,
            type: dto.type,
            transactionId: transaction.id,
          },
        },
      });

      return {
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          sku: updatedProduct.sku,
          stockQuantity: updatedProduct.stockQuantity,
        },
        transaction,
      };
    });

    return result;
  }

  /**
   * Admin: Get paginated list of inventory transactions
   */
  async getTransactions(query: InventoryQueryDto): Promise<PaginatedResult<any>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 15));
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryTransactionWhereInput = {};

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [total, data] = await Promise.all([
      this.prisma.inventoryTransaction.count({ where }),
      this.prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              slug: true,
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
   * Admin: List products below or at low-stock threshold
   */
  async getLowStockProducts(threshold = 5) {
    const safeThreshold = Math.max(0, threshold);
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: { lte: safeThreshold },
      },
      orderBy: { stockQuantity: 'asc' },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        stockQuantity: true,
        price: true,
        category: {
          select: { name: true },
        },
        brand: {
          select: { name: true },
        },
      },
    });
  }
}
