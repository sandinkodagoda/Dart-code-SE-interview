import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PayhereNotificationDto } from './dto/payhere-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payhere/initiate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initiate PayHere payment (public)',
    description:
      'Generates the required PayHere form data and checkout URL. All financial values are sourced from the database — the frontend must never calculate or inject prices.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PayHere payment data generated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Order already paid',
  })
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayHerePayment(dto);
  }

  @Post('payhere/notify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'PayHere server-to-server payment notification (webhook)',
    description:
      'CRITICAL: This is the only authoritative payment confirmation endpoint. PayHere calls this directly. MD5 signature is verified server-side before payment is marked PAID. Frontend success redirect is NOT a confirmation.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification processed',
  })
  async payhereNotify(@Body() payload: PayhereNotificationDto) {
    await this.paymentsService.handlePayhereNotification(payload);
    return { received: true };
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get payment records for an order (Admin)',
    description: 'Returns payment records and all payment events for audit purposes.',
  })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment records with events',
  })
  async getOrderPayments(@Param('orderId') orderId: string) {
    return this.paymentsService.getOrderPayments(orderId);
  }
}
