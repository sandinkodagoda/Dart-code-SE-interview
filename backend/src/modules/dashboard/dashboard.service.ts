import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

const LOW_STOCK_THRESHOLD = 5;
const RECENT_ORDERS_LIMIT = 10;

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Admin dashboard overview metrics.
   * All queries run in parallel via Promise.all for performance.
   */
  async getOverview() {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCustomers,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      // Orders
      this.prisma.order.count(),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.CONFIRMED } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.PROCESSING } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.CANCELLED } }),

      // Products
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({
        where: {
          isActive: true,
          stockQuantity: { gt: 0, lte: LOW_STOCK_THRESHOLD },
        },
      }),
      this.prisma.product.count({
        where: { isActive: true, stockQuantity: 0 },
      }),

      // Customers
      this.prisma.customer.count(),

      // Total Revenue (sum of PAID orders)
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: PaymentStatus.PAID },
      }),

      // Recent orders
      this.prisma.order.findMany({
        take: RECENT_ORDERS_LIMIT,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          total: true,
          orderStatus: true,
          paymentStatus: true,
          paymentMethod: true,
          createdAt: true,
          items: {
            select: { id: true, productName: true, quantity: true },
          },
        },
      }),
    ]);

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        processing: processingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
      },
      customers: {
        total: totalCustomers,
      },
      revenue: {
        total: revenueResult._sum.total
          ? Number(revenueResult._sum.total)
          : 0,
        currency: 'LKR',
      },
      recentOrders,
    };
  }
}
