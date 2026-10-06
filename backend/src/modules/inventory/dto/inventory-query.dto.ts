import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryTransactionType } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class InventoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter transactions by product UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4')
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filter transactions by transaction type',
    enum: InventoryTransactionType,
  })
  @IsOptional()
  @IsEnum(InventoryTransactionType)
  type?: InventoryTransactionType;
}
