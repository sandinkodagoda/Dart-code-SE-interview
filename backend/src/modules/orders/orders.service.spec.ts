import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrdersService } from './orders.service';
import { PaymentMethod, OrderStatus, PaymentStatus } from '@prisma/client';

describe('OrdersService - Core Business Rules', () => {
  let service: OrdersService;
  let prisma: any;
  let configService: any;
  let customersService: any;

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      inventoryTransaction: {
        create: jest.fn(),
      },
      orderItem: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      payment: {
        create: jest.fn().mockResolvedValue({ id: 'pay-uuid-1' }),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        return cb(prisma);
      }),
    };

    configService = {
      get: jest.fn((key: string, defaultValue?: any) => defaultValue),
    };

    customersService = {
      findOrCreate: jest.fn().mockResolvedValue({
        id: 'customer-uuid-1',
        email: 'guest@example.com',
      }),
    };

    service = new OrdersService(prisma, customersService, configService);
  });

  describe('Server-side price calculation & stock verification', () => {
    it('rejects order if a requested product does not exist or is inactive', async () => {
      prisma.product.findMany.mockResolvedValue([]); // Empty!

      await expect(
        service.createOrder({
          paymentMethod: PaymentMethod.WHATSAPP,
          customerName: 'Jane Doe',
          customerEmail: 'jane@example.com',
          customerPhone: '0771234567',
          addressLine1: '456 Marine Drive',
          city: 'Colombo',
          items: [{ productId: '550e8400-e29b-41d4-a716-446655440001', quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects order when product stock is insufficient', async () => {
      prisma.product.findMany.mockResolvedValue([
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'PlayStation 5 Pro',
          sku: 'SONY-PS5-PRO',
          price: new Prisma.Decimal(275000),
          stockQuantity: 2, // Only 2 available!
          isActive: true,
        },
      ]);

      await expect(
        service.createOrder({
          paymentMethod: PaymentMethod.WHATSAPP,
          customerName: 'Jane Doe',
          customerEmail: 'jane@example.com',
          customerPhone: '0771234567',
          addressLine1: '456 Marine Drive',
          city: 'Colombo',
          items: [{ productId: '550e8400-e29b-41d4-a716-446655440002', quantity: 5 }], // Requesting 5!
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('calculates total using server database price regardless of frontend input', async () => {
      prisma.product.findMany.mockResolvedValue([
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'AirPods Pro 2',
          sku: 'APL-APP2',
          price: new Prisma.Decimal(79000), // Server price Decimal
          stockQuantity: 10,
          isActive: true,
        },
      ]);

      const mockCreatedOrder = {
        id: 'order-1',
        orderNumber: 'TECH-2026-000002',
        subtotal: new Prisma.Decimal(158000),
        deliveryFee: new Prisma.Decimal(0),
        total: new Prisma.Decimal(158000),
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        items: [
          {
            id: 'item-1',
            productId: '550e8400-e29b-41d4-a716-446655440003',
            productName: 'AirPods Pro 2',
            sku: 'APL-APP2',
            unitPrice: new Prisma.Decimal(79000),
            quantity: 2,
            total: new Prisma.Decimal(158000),
          },
        ],
        payments: [{ id: 'pay-1', status: PaymentStatus.PENDING }],
      };

      prisma.order.create.mockResolvedValue(mockCreatedOrder);
      prisma.order.findUnique.mockResolvedValue(mockCreatedOrder);

      const order = await service.createOrder({
        paymentMethod: PaymentMethod.WHATSAPP,
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customerPhone: '0771234567',
        addressLine1: '456 Marine Drive',
        city: 'Colombo',
        items: [{ productId: '550e8400-e29b-41d4-a716-446655440003', quantity: 2 }],
      });

      // Verify that total is 158000
      expect(Number(order.total)).toBe(158000);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440003' },
        data: { stockQuantity: 8 }, // 10 - 2 = 8
      });
    });
  });
});
