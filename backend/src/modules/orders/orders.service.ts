import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, OrderStatus, PaymentMethod, PaymentStatus, InventoryTransactionType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { isValidOrderTransition } from './order-status.transitions';
import { PaginatedResult } from '../../common/dto/pagination.dto';

/** Delivery fee constants — centralised so they are never set by the frontend */
const DELIVERY_FEE = new Prisma.Decimal(350); // LKR 350 flat rate
const FREE_DELIVERY_THRESHOLD = new Prisma.Decimal(10000); // Free above LKR 10,000

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
    private readonly configService: ConfigService,
  ) {}

  // ──────────────────────────────────────────────────────────────
  // ORDER NUMBER GENERATOR
  // ──────────────────────────────────────────────────────────────

  /**
   * Generates a human-readable, sequential order number.
   * Format: TECH-{YEAR}-{6-digit-sequence}  e.g. TECH-2026-000001
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `TECH-${year}-`;

    const lastOrder = await this.prisma.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });

    let nextSeq = 1;
    if (lastOrder) {
      const parts = lastOrder.orderNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  // ──────────────────────────────────────────────────────────────
  // PHASE 12/13: PUBLIC CHECKOUT (GUEST)
  // ──────────────────────────────────────────────────────────────

  /**
   * Create an order from a guest checkout request.
   *
   * Security rules enforced:
   * - Products loaded from DB — frontend prices never trusted
   * - Products must be active
   * - Stock verified and deducted atomically in a DB transaction
   * - All totals calculated server-side
   * - Order and InventoryTransaction created in one transaction
   */
  async createOrder(dto: CreateOrderDto) {
    // 1. Validate all product IDs are unique in the request
    const productIds = dto.items.map((i) => i.productId);
    const uniqueIds = new Set(productIds);
    if (uniqueIds.size !== productIds.length) {
      throw new BadRequestException(
        'Duplicate products in order. Merge quantities for the same product.',
      );
    }

    // 2. Load products from DB
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // 3. Verify all products exist
    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missing = productIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Products not found: ${missing.join(', ')}`);
    }

    // 4. Verify all products are active
    const inactiveProducts = products.filter((p) => !p.isActive);
    if (inactiveProducts.length > 0) {
      const names = inactiveProducts.map((p) => p.name).join(', ');
      throw new BadRequestException(
        `The following products are no longer available: ${names}`,
      );
    }

    // 5. Verify stock availability
    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const item of dto.items) {
      const product = productMap.get(item.productId)!;
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
        );
      }
    }

    // 6. Server-side price calculation (backend is source of truth)
    let subtotal = new Prisma.Decimal(0);
    const lineItems = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = product.price;
      const lineTotal = unitPrice.mul(item.quantity);
      subtotal = subtotal.add(lineTotal);
      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice,
        quantity: item.quantity,
        total: lineTotal,
      };
    });

    // 7. Server-side delivery fee calculation
    const deliveryFee = subtotal.gte(FREE_DELIVERY_THRESHOLD)
      ? new Prisma.Decimal(0)
      : DELIVERY_FEE;

    const total = subtotal.add(deliveryFee);

    // 8. Find-or-create the guest customer record
    const customer = await this.customersService.findOrCreate({
      name: dto.customerName,
      email: dto.customerEmail,
      phone: dto.customerPhone,
    });

    // 9. Generate order number
    const orderNumber = await this.generateOrderNumber();

    // 10. Atomic transaction: order + items + inventory deduction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerName: dto.customerName.trim(),
          customerEmail: dto.customerEmail.toLowerCase().trim(),
          customerPhone: dto.customerPhone.trim(),
          addressLine1: dto.addressLine1.trim(),
          addressLine2: dto.addressLine2?.trim() || null,
          city: dto.city.trim(),
          postalCode: dto.postalCode?.trim() || null,
          subtotal,
          deliveryFee,
          total,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          orderStatus: OrderStatus.PENDING,
          customerNotes: dto.customerNotes?.trim() || null,
        },
      });

      // Create order items (snapshot of product name, SKU, and price)
      await tx.orderItem.createMany({
        data: lineItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          total: item.total,
        })),
      });

      // Deduct stock and log inventory transactions for each item
      for (const item of lineItems) {
        const product = productMap.get(item.productId)!;
        const previousStock = product.stockQuantity;
        const newStock = previousStock - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: newStock },
        });

        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: InventoryTransactionType.SALE,
            quantity: item.quantity,
            previousStock,
            newStock,
            reason: `Sale — Order ${orderNumber}`,
            reference: newOrder.id,
          },
        });
      }

      // Create a pending Payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: dto.paymentMethod,
          status: PaymentStatus.PENDING,
          amount: total,
          provider: dto.paymentMethod === PaymentMethod.PAYHERE ? 'PayHere' : 'WhatsApp',
        },
      });

      return newOrder;
    });

    // 11. Return the full order including items
    return this.findOrderById(order.id);
  }

  // ──────────────────────────────────────────────────────────────
  // PUBLIC: ORDER LOOKUP BY NUMBER
  // ──────────────────────────────────────────────────────────────

  async findOrderByNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: orderNumber.toUpperCase() },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order '${orderNumber}' not found`);
    }

    return order;
  }

  // ──────────────────────────────────────────────────────────────
  // INTERNAL: FULL ORDER DETAIL
  // ──────────────────────────────────────────────────────────────

  async findOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found`);
    }

    return order;
  }

  // ──────────────────────────────────────────────────────────────
  // PHASE 16: ADMIN ORDER MANAGEMENT
  // ──────────────────────────────────────────────────────────────

  /**
   * Admin: List all orders with filters and pagination
   */
  async findAllAdmin(query: AdminOrderQueryDto): Promise<PaginatedResult<any>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 15));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (query.orderStatus) where.orderStatus = query.orderStatus;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.paymentMethod) where.paymentMethod = query.paymentMethod;

    if (query.orderNumber) {
      where.orderNumber = {
        contains: query.orderNumber.trim(),
        mode: 'insensitive',
      };
    }

    if (query.customer) {
      const term = query.customer.trim();
      where.OR = [
        { customerEmail: { contains: term, mode: 'insensitive' } },
        { customerPhone: { contains: term, mode: 'insensitive' } },
        { customerName: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const [total, data] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { select: { id: true, productName: true, quantity: true, total: true } },
          payments: { select: { id: true, status: true, method: true, amount: true, paidAt: true } },
        },
      }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Admin: Get full order details
   */
  async findAdminById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          include: { events: { orderBy: { createdAt: 'desc' }, take: 10 } },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID '${id}' not found`);
    }

    return order;
  }

  /**
   * Admin: Update order status with transition validation
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto, adminId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true, orderStatus: true, customerId: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID '${id}' not found`);
    }

    if (!isValidOrderTransition(order.orderStatus, dto.status)) {
      throw new BadRequestException(
        `Cannot transition order from ${order.orderStatus} to ${dto.status}. Allowed transitions from ${order.orderStatus}: ${this.getAllowedTransitionsText(order.orderStatus)}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { orderStatus: dto.status },
      });

      // If cancellation, restore stock
      if (dto.status === OrderStatus.CANCELLED) {
        await this.restoreStockForOrder(id, order.orderNumber, tx);
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          adminId: adminId || null,
          action: 'ORDER_STATUS_CHANGED',
          entityType: 'Order',
          entityId: id,
          previousValue: { orderStatus: order.orderStatus },
          newValue: {
            orderStatus: dto.status,
            note: dto.cancellationReason || dto.note || null,
          },
        },
      });

      return updatedOrder;
    });

    return this.findAdminById(updated.id);
  }

  /**
   * Restore inventory when an order is cancelled
   */
  private async restoreStockForOrder(
    orderId: string,
    orderNumber: string,
    tx: Prisma.TransactionClient,
  ) {
    const items = await tx.orderItem.findMany({
      where: { orderId },
      include: {
        product: { select: { id: true, stockQuantity: true } },
      },
    });

    for (const item of items) {
      if (!item.product) continue;

      const previousStock = item.product.stockQuantity;
      const newStock = previousStock + item.quantity;

      await tx.product.update({
        where: { id: item.product.id },
        data: { stockQuantity: newStock },
      });

      await tx.inventoryTransaction.create({
        data: {
          productId: item.product.id,
          type: InventoryTransactionType.CANCELLATION,
          quantity: item.quantity,
          previousStock,
          newStock,
          reason: `Stock restored — Order ${orderNumber} cancelled`,
          reference: orderId,
        },
      });
    }

    this.logger.log(`Stock restored for cancelled order: ${orderNumber}`);
  }

  private getAllowedTransitionsText(current: OrderStatus): string {
    const { ALLOWED_ORDER_TRANSITIONS } = require('./order-status.transitions');
    const allowed: OrderStatus[] = ALLOWED_ORDER_TRANSITIONS[current] ?? [];
    return allowed.length > 0 ? allowed.join(', ') : 'none (terminal state)';
  }
}
