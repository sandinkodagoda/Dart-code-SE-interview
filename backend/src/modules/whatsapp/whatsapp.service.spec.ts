import { WhatsappService } from './whatsapp.service';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@prisma/client';

describe('WhatsappService', () => {
  let service: WhatsappService;

  const mockConfigService: any = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === 'whatsapp.businessNumber') return '94771234567';
      return defaultValue;
    }),
  };

  beforeEach(() => {
    service = new WhatsappService(mockConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generates a valid wa.me deep link with encoded message and business number', () => {
    const mockOrder = {
      id: 'uuid-1234',
      orderNumber: 'TECH-2026-000001',
      createdAt: new Date('2026-01-15T10:00:00Z'),
      customerName: 'Kamal Perera',
      customerPhone: '0771234567',
      customerEmail: 'kamal@example.com',
      addressLine1: '123 Galle Road',
      city: 'Colombo',
      subtotal: 595000,
      deliveryFee: 0,
      total: 595000,
      paymentMethod: PaymentMethod.WHATSAPP,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      customerNotes: 'Please call before arrival',
      items: [
        {
          id: 'item-1',
          productName: 'iPhone 15 Pro Max 256GB',
          sku: 'APL-IP15PM-256-NT',
          unitPrice: 595000,
          quantity: 1,
          total: 595000,
        },
      ],
    };

    const result = service.buildWhatsAppOrderMessage(mockOrder);

    expect(result.whatsappUrl).toBeDefined();
    expect(result.whatsappUrl).toContain('https://wa.me/94771234567?text=');
    expect(result.businessNumber).toBe('94771234567');
    expect(result.whatsappMessage).toContain('TECH-2026-000001');
    expect(result.whatsappMessage).toContain('Kamal Perera');
    expect(result.whatsappMessage).toContain('iPhone 15 Pro Max 256GB');
    expect(result.whatsappMessage).toContain('595,000');
    expect(result.whatsappMessage).toContain('Please call before arrival');
    expect(result.order.orderNumber).toBe('TECH-2026-000001');
  });
});
