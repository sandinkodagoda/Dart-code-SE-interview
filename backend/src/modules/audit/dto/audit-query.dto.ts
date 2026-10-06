import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class AuditQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by action name (e.g. ADMIN_LOGIN, PRODUCT_CREATED, STOCK_ADJUSTED, ORDER_STATUS_UPDATED)',
    example: 'ORDER_STATUS_UPDATED',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: 'Filter by entity type (e.g. Order, Product, Category, Brand, Inventory, AdminUser)',
    example: 'Order',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Filter by admin UUID who performed the action',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @IsOptional()
  @IsUUID('4')
  adminId?: string;

  @ApiPropertyOptional({
    description: 'Filter logs created on or after this date (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter logs created on or before this date (ISO 8601)',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
