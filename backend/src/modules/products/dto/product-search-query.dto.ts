import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export enum ProductSortOption {
  NEWEST = 'newest',
  PRICE_ASC = 'price-asc',
  PRICE_DESC = 'price-desc',
  NAME_ASC = 'name-asc',
}

export class ProductSearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search keyword matching product name, description, or SKU',
    example: 'iPhone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Category slug or UUID filter',
    example: 'mobile-phones',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Brand slug or UUID filter',
    example: 'apple',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 2000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter for items currently in stock (stockQuantity > 0)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({
    description: 'Filter only featured products',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Sorting criteria',
    enum: ProductSortOption,
    default: ProductSortOption.NEWEST,
  })
  @IsOptional()
  @IsIn([
    ProductSortOption.NEWEST,
    ProductSortOption.PRICE_ASC,
    ProductSortOption.PRICE_DESC,
    ProductSortOption.NAME_ASC,
  ])
  sort?: ProductSortOption = ProductSortOption.NEWEST;
}
