import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductSearchQueryDto } from './product-search-query.dto';

export class AdminProductQueryDto extends ProductSearchQueryDto {
  @ApiPropertyOptional({
    description: 'Filter products by active status (Admin only)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}
