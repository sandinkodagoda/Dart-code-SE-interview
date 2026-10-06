import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { PaymentMethod } from '@prisma/client';

@ApiTags('WhatsApp')
@Controller('orders/whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'WhatsApp Checkout — create order and get WhatsApp deep link',
    description:
      'Creates an order using the WhatsApp payment method, applies backend price calculation and stock validation, then returns a wa.me deep link with a pre-composed business order message.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created and WhatsApp message generated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error, insufficient stock, or wrong payment method',
  })
  async whatsappCheckout(@Body() dto: CreateOrderDto) {
    // Enforce WhatsApp payment method
    if (dto.paymentMethod !== PaymentMethod.WHATSAPP) {
      dto = { ...dto, paymentMethod: PaymentMethod.WHATSAPP };
    }

    // Create order through the standard order engine (same rules apply)
    const order = await this.ordersService.createOrder(dto);

    // Build and return WhatsApp message + deep link
    return this.whatsappService.buildWhatsAppOrderMessage(order);
  }
}
