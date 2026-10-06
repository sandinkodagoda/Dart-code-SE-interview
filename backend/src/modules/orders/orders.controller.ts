import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Place an order (Guest Checkout)',
    description:
      'Creates a new order from guest checkout. Backend loads authoritative product prices, validates stock, calculates totals, deducts inventory — all atomically. Frontend prices are never trusted.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error, insufficient stock, or inactive product',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'One or more products not found',
  })
  async checkout(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get(':orderNumber')
  @ApiOperation({
    summary: 'Look up order by order number',
    description:
      'Public endpoint to retrieve a customer-facing order summary by order number (e.g. TECH-2026-000001).',
  })
  @ApiParam({
    name: 'orderNumber',
    description: 'Human-readable order number',
    example: 'TECH-2026-000001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order details retrieved',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  async findOne(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findOrderByNumber(orderNumber);
  }
}
