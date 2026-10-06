import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * PayHere sends notification data as form-encoded POST fields.
 * We map the fields we care about for verification and payment recording.
 *
 * Reference: https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout
 */
export class PayhereNotificationDto {
  @ApiProperty({ description: 'PayHere merchant ID' })
  @IsString()
  merchant_id: string;

  @ApiProperty({ description: 'Internal order ID passed to PayHere' })
  @IsString()
  order_id: string;

  @ApiProperty({ description: 'PayHere payment ID' })
  @IsString()
  payment_id: string;

  @ApiProperty({ description: 'Payment status code: 2=success, 0=pending, -1=cancelled, -2=failed' })
  @IsString()
  status_code: string;

  @ApiPropertyOptional({ description: 'Human-readable status message' })
  @IsOptional()
  @IsString()
  status_message?: string;

  @ApiProperty({ description: 'Amount paid' })
  @IsString()
  payhere_amount: string;

  @ApiProperty({ description: 'Currency' })
  @IsString()
  payhere_currency: string;

  @ApiPropertyOptional({ description: 'Payment method used' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: 'PayHere MD5 hash for verification' })
  @IsOptional()
  @IsString()
  md5sig?: string;

  @ApiPropertyOptional({ description: 'Customer first name' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ description: 'Customer last name' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ description: 'Customer email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  @IsOptional()
  @IsString()
  phone?: string;
}
