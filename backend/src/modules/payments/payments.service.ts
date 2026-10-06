import * as crypto from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PaymentStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PayhereNotificationDto } from './dto/payhere-notification.dto';

/** PayHere status codes */
const PAYHERE_STATUS = {
  SUCCESS: '2',
  PENDING: '0',
  CANCELLED: '-1',
  FAILED: '-2',
} as const;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // ──────────────────────────────────────────────────────────────
  // PAYHERE INITIATION
  // ──────────────────────────────────────────────────────────────

  /**
   * Builds the PayHere payment form data that the Next.js frontend
   * uses to redirect the customer to the PayHere checkout page.
   *
   * IMPORTANT: All financial values are sourced from the database.
   * The frontend must never calculate or inject prices.
   */
  async initiatePayHerePayment(dto: InitiatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        items: true,
        payments: { where: { status: PaymentStatus.PENDING } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order '${dto.orderId}' not found`);
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    const merchantId = this.configService.get<string>('payhere.merchantId', '');
    const merchantSecret = this.configService.get<string>('payhere.merchantSecret', '');
    const currency = this.configService.get<string>('payhere.currency', 'LKR');
    const baseUrl = this.configService.get<string>('payhere.baseUrl', 'https://sandbox.payhere.lk/pay/checkout');
    const frontendUrl = this.configService.get<string>('app.frontendUrl', 'http://localhost:3000');

    const amount = Number(order.total).toFixed(2);

    // MD5 hash: merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()
    const secretHash = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    const hashInput = `${merchantId}${order.orderNumber}${amount}${currency}${secretHash}`;
    const md5Hash = crypto
      .createHash('md5')
      .update(hashInput)
      .digest('hex')
      .toUpperCase();

    const paymentData = {
      // Merchant
      merchant_id: merchantId,
      return_url: `${frontendUrl}/checkout/success?orderNumber=${order.orderNumber}`,
      cancel_url: `${frontendUrl}/checkout/cancel?orderNumber=${order.orderNumber}`,
      notify_url: `${this.configService.get<string>('app.frontendUrl', 'http://localhost:3000')}/api/v1/payments/payhere/notify`,

      // Order
      order_id: order.orderNumber,
      items: order.items.map((i) => i.productName).join(', ').substring(0, 255),
      currency,
      amount,
      hash: md5Hash,

      // Customer (pre-fill PayHere form)
      first_name: order.customerName.split(' ')[0] || order.customerName,
      last_name: order.customerName.split(' ').slice(1).join(' ') || 'N/A',
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.addressLine1,
      city: order.city,
      country: 'Sri Lanka',
    };

    return {
      paymentData,
      checkoutUrl: baseUrl,
      orderNumber: order.orderNumber,
      amount: Number(order.total),
      currency,
    };
  }

  // ──────────────────────────────────────────────────────────────
  // PAYHERE SERVER NOTIFICATION (THE AUTHORITATIVE CONFIRMATION)
  // ──────────────────────────────────────────────────────────────

  /**
   * Processes the PayHere server-to-server notification.
   *
   * CRITICAL SECURITY RULE (from master spec §15 and §37 Rule 6 & 7):
   * - Payment is ONLY marked PAID when THIS callback is verified
   * - Frontend success redirect is never the source of truth
   * - Merchant secret stays on the backend
   */
  async handlePayhereNotification(payload: PayhereNotificationDto): Promise<void> {
    this.logger.log(
      `PayHere notification received for order: ${payload.order_id}, status: ${payload.status_code}`,
    );

    // 1. Save the raw notification event first (for debugging/traceability)
    const payment = await this.findOrCreatePendingPayment(payload.order_id);

    if (!payment) {
      this.logger.error(
        `No pending payment found for PayHere order_id: ${payload.order_id}`,
      );
      await this.recordPaymentEvent(null, 'NOTIFICATION_RECEIVED', payload, 'NO_PAYMENT_FOUND');
      return;
    }

    await this.recordPaymentEvent(payment.id, 'NOTIFICATION_RECEIVED', payload);

    // 2. Verify MD5 signature
    const isValid = this.verifyPayhereSignature(payload);
    if (!isValid) {
      this.logger.warn(
        `Invalid PayHere signature for order: ${payload.order_id}`,
      );
      await this.recordPaymentEvent(payment.id, 'SIGNATURE_INVALID', payload);
      return;
    }

    // 3. Process based on status code
    if (payload.status_code === PAYHERE_STATUS.SUCCESS) {
      await this.markPaymentSuccessful(payment, payload);
    } else if (
      payload.status_code === PAYHERE_STATUS.CANCELLED ||
      payload.status_code === PAYHERE_STATUS.FAILED
    ) {
      await this.markPaymentFailed(payment, payload);
    } else {
      this.logger.log(
        `PayHere notification with unhandled status: ${payload.status_code} for order ${payload.order_id}`,
      );
    }
  }

  /**
   * Verify PayHere MD5 signature
   * Formula: MD5(merchant_id + order_id + payhere_amount + payhere_currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
   */
  private verifyPayhereSignature(payload: PayhereNotificationDto): boolean {
    try {
      const merchantSecret = this.configService.get<string>('payhere.merchantSecret', '');
      const merchantId = this.configService.get<string>('payhere.merchantId', '');

      const secretHash = crypto
        .createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

      const hashInput = `${merchantId}${payload.order_id}${payload.payhere_amount}${payload.payhere_currency}${payload.status_code}${secretHash}`;
      const expected = crypto
        .createHash('md5')
        .update(hashInput)
        .digest('hex')
        .toUpperCase();

      return expected === (payload.md5sig || '').toUpperCase();
    } catch (err) {
      this.logger.error('Error verifying PayHere signature', err);
      return false;
    }
  }

  private async findOrCreatePendingPayment(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        payments: {
          where: { status: { not: PaymentStatus.PAID } },
          take: 1,
        },
      },
    });

    if (!order) return null;
    return order.payments[0] || null;
  }

  private async markPaymentSuccessful(
    payment: any,
    payload: PayhereNotificationDto,
  ) {
    await this.prisma.$transaction(async (tx) => {
      // Update payment record
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          transactionId: payload.payment_id,
          providerReference: payload.payment_id,
          paidAt: new Date(),
          provider: `PayHere/${payload.method || 'unknown'}`,
        },
      });

      // Update order payment status and confirm the order
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          orderStatus: OrderStatus.CONFIRMED,
        },
      });

      await this.recordPaymentEventTx(
        tx,
        payment.id,
        'PAYMENT_CONFIRMED',
        payload,
      );
    });

    this.logger.log(
      `Payment CONFIRMED for order: ${payment.orderId}, PayHere ID: ${payload.payment_id}`,
    );
  }

  private async markPaymentFailed(
    payment: any,
    payload: PayhereNotificationDto,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      await this.recordPaymentEventTx(
        tx,
        payment.id,
        'PAYMENT_FAILED',
        payload,
      );
    });

    this.logger.log(
      `Payment FAILED for order: ${payment.orderId}, status: ${payload.status_code}`,
    );
  }

  private async recordPaymentEvent(
    paymentId: string | null,
    eventType: string,
    payload: Record<string, any>,
    note?: string,
  ) {
    if (!paymentId) return;
    try {
      await this.prisma.paymentEvent.create({
        data: {
          paymentId,
          eventType,
          payload: {
            ...payload,
            // Strip sensitive fields from event log
            md5sig: undefined,
            merchant_id: '[REDACTED]',
            note,
          } as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.warn('Failed to record payment event', err);
    }
  }

  private async recordPaymentEventTx(
    tx: Prisma.TransactionClient,
    paymentId: string,
    eventType: string,
    payload: Record<string, any>,
  ) {
    await tx.paymentEvent.create({
      data: {
        paymentId,
        eventType,
        payload: {
          ...payload,
          md5sig: undefined,
          merchant_id: '[REDACTED]',
        } as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Admin: Get payment record with events for an order
   */
  async getOrderPayments(orderId: string) {
    return this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: {
        events: { orderBy: { createdAt: 'desc' } },
      },
    });
  }
}
