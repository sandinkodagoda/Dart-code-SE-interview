import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order, OrderItem } from '@prisma/client';

export interface WhatsAppOrderResult {
  order: any;
  whatsappUrl: string;
  whatsappMessage: string;
  businessNumber: string;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate a human-readable WhatsApp order message and a wa.me deep link.
   *
   * The message is formatted so business staff can read it clearly.
   * Pricing is sourced from the already-created order (backend-calculated totals).
   */
  buildWhatsAppOrderMessage(order: any): WhatsAppOrderResult {
    const businessNumber = this.configService.get<string>(
      'whatsapp.businessNumber',
      '94711093799',
    );

    const lines: string[] = [];

    lines.push('🛒 *NEW ORDER — Nexora*');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`📦 *Order Number:* ${order.orderNumber}`);
    lines.push(`📅 *Date:* ${new Date(order.createdAt).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`);
    lines.push('');

    lines.push('👤 *Customer Details*');
    lines.push(`• Name: ${order.customerName}`);
    lines.push(`• Email: ${order.customerEmail}`);
    lines.push(`• Phone: ${order.customerPhone}`);
    lines.push('');

    lines.push('🏠 *Delivery Address*');
    lines.push(`• ${order.addressLine1}`);
    if (order.addressLine2) lines.push(`• ${order.addressLine2}`);
    lines.push(`• ${order.city}${order.postalCode ? ` ${order.postalCode}` : ''}`);
    lines.push('');

    lines.push('🛍️ *Order Items*');
    const items: OrderItem[] = order.items || [];
    for (const item of items) {
      const price = Number(item.unitPrice).toLocaleString('en-LK', {
        minimumFractionDigits: 2,
      });
      const total = Number(item.total).toLocaleString('en-LK', {
        minimumFractionDigits: 2,
      });
      lines.push(
        `• ${item.productName} (SKU: ${item.sku})`,
      );
      lines.push(
        `  Qty: ${item.quantity} × LKR ${price} = LKR ${total}`,
      );
    }
    lines.push('');

    const subtotal = Number(order.subtotal).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
    });
    const deliveryFee = Number(order.deliveryFee).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
    });
    const total = Number(order.total).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
    });

    lines.push('💰 *Order Summary*');
    lines.push(`• Subtotal:      LKR ${subtotal}`);
    lines.push(`• Delivery Fee:  LKR ${deliveryFee}`);
    lines.push(`• *TOTAL:        LKR ${total}*`);
    lines.push('');

    lines.push(`💳 *Payment Method:* ${order.paymentMethod}`);

    if (order.customerNotes) {
      lines.push('');
      lines.push(`📝 *Customer Notes:* ${order.customerNotes}`);
    }

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('_Please confirm availability and contact customer._');

    const message = lines.join('\n');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodedMessage}`;

    this.logger.log(
      `WhatsApp order link generated for Order: ${order.orderNumber}`,
    );

    return {
      order,
      whatsappUrl,
      whatsappMessage: message,
      businessNumber,
    };
  }
}
