import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  NotEquals,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryTransactionType } from '@prisma/client';

export class AdjustStockDto {
  @ApiProperty({
    description: 'Product UUID to adjust inventory for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description:
      'Inventory change amount. Use positive integer to increase stock, negative integer to decrease stock (for adjustments)',
    example: 15,
  })
  @Type(() => Number)
  @IsInt()
  @NotEquals(0, { message: 'Quantity change must not be zero' })
  quantity: number;

  @ApiProperty({
    description: 'Transaction category',
    enum: [
      InventoryTransactionType.RESTOCK,
      InventoryTransactionType.ADJUSTMENT,
      InventoryTransactionType.STOCK_IN,
    ],
    example: InventoryTransactionType.RESTOCK,
  })
  @IsEnum(InventoryTransactionType)
  type: InventoryTransactionType;

  @ApiPropertyOptional({
    description: 'Business reason for this inventory adjustment',
    example: 'New supplier shipment arrived (PO #1042)',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;

  @ApiPropertyOptional({
    description: 'External reference number, invoice number, or audit batch code',
    example: 'PO-2026-1042',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;
}
