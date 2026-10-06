import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class OrderItemRequestDto {
  @ApiProperty({
    description: 'Product UUID to order',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity to order (1-99)',
    example: 2,
    minimum: 1,
    maximum: 99,
  })
  @IsInt()
  @Min(1)
  @Max(99)
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  // ── Customer info ──────────────────────────────────────────
  @ApiProperty({
    description: 'Customer full name',
    example: 'Kamal Perera',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'kamal.perera@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '0771234567',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+0-9\s-]{7,20}$/, {
    message: 'Phone number must be between 7 and 20 characters',
  })
  customerPhone: string;

  // ── Delivery address ────────────────────────────────────────
  @ApiProperty({
    description: 'Street address line 1',
    example: 'No 45, Galle Road',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'Street address line 2 / Apartment / Suite',
    example: 'Level 4, Apt B',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @ApiProperty({
    description: 'City or district',
    example: 'Colombo 03',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({
    description: 'Postal / ZIP code',
    example: '00300',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  // ── Payment method ──────────────────────────────────────────
  @ApiProperty({
    description: 'Payment method selected by customer',
    enum: PaymentMethod,
    example: PaymentMethod.PAYHERE,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  // ── Cart items ──────────────────────────────────────────────
  @ApiProperty({
    description: 'Array of products and quantities to order',
    type: [OrderItemRequestDto],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Order must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemRequestDto)
  items: OrderItemRequestDto[];

  // ── Optional notes ──────────────────────────────────────────
  @ApiPropertyOptional({
    description: 'Optional delivery notes or special instructions',
    example: 'Please ring the doorbell twice',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  customerNotes?: string;
}
