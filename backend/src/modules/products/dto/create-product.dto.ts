import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsUUID,
  IsBoolean,
  IsObject,
  IsArray,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductInitialImageDto {
  @ApiProperty({
    description: 'Image URL',
    example: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Alt text for accessibility',
    example: 'Front view of smartphone',
  })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({
    description: 'Display order',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;

  @ApiPropertyOptional({
    description: 'Whether this image is the primary hero image',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Apple iPhone 15 Pro Max 256GB',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated from name if omitted)',
    example: 'apple-iphone-15-pro-max-256gb',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase alphanumeric characters and hyphens',
  })
  slug?: string;

  @ApiProperty({
    description: 'Stock Keeping Unit (SKU) - unique product code',
    example: 'IPHONE15-PM-256-TI',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiProperty({
    description: 'Detailed product description / overview',
    example: 'Forged in titanium and featuring the groundbreaking A17 Pro chip...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Category UUID',
    example: 'c3757fa9-0d12-4eb1-b258-15a0c3bbff11',
  })
  @IsUUID('4')
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Brand UUID',
    example: 'b5612fa9-0d12-4eb1-b258-15a0c3bbff22',
  })
  @IsUUID('4')
  @IsNotEmpty()
  brandId: string;

  @ApiProperty({
    description: 'Product selling price',
    example: 1199.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    description: 'Original or compare-at price (for discounts)',
    example: 1299.99,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  compareAtPrice?: number;

  @ApiPropertyOptional({
    description: 'Initial stock quantity',
    default: 0,
    example: 25,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stockQuantity?: number = 0;

  @ApiPropertyOptional({
    description: 'Warranty terms',
    example: '1 Year Official AppleCare Warranty',
  })
  @IsOptional()
  @IsString()
  warranty?: string;

  @ApiPropertyOptional({
    description:
      'Dynamic JSON specifications (e.g. RAM, storage, processor, display, color)',
    example: {
      screen: '6.7 inch Super Retina XDR OLED',
      ram: '8GB',
      storage: '256GB',
      chipset: 'Apple A17 Pro',
      color: 'Natural Titanium',
    },
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether the product is featured on the homepage/highlights',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether the product is active and visible in the public store',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Initial gallery images for the product',
    type: [ProductInitialImageDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductInitialImageDto)
  images?: ProductInitialImageDto[];
}
