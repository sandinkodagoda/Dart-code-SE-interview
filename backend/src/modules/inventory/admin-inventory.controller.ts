import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin - Inventory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('adjust')
  @ApiOperation({
    summary: 'Adjust product stock (Admin)',
    description:
      'Adjusts inventory for a product atomically, prevents negative stock, logs an InventoryTransaction, and writes an administrative audit log.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory adjusted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Negative stock attempted or invalid parameters',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async adjustStock(
    @Body() dto: AdjustStockDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.inventoryService.adjustStock(dto, adminId);
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'List inventory transaction logs (Admin)',
    description:
      'Retrieves paginated audit log of all stock movements (stock-in, sale, restock, adjustment, cancellation).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated list of inventory transactions',
  })
  async getTransactions(@Query() query: InventoryQueryDto) {
    return this.inventoryService.getTransactions(query);
  }

  @Get('low-stock')
  @ApiOperation({
    summary: 'Get low stock products (Admin)',
    description:
      'Retrieves all active products with stock levels at or below the specified threshold (default: 5 units).',
  })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: Number,
    description: 'Stock threshold limit (default: 5)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of low-stock products',
  })
  async getLowStock(
    @Query('threshold', new ParseIntPipe({ optional: true }))
    threshold?: number,
  ) {
    return this.inventoryService.getLowStockProducts(threshold ?? 5);
  }
}
