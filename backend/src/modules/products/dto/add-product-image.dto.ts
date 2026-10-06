import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddProductImageDto {
  @ApiProperty({
    description: 'Direct image URL',
    example: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
  })
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Accessibility alt text',
    example: 'Side profile of product in natural titanium',
  })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({
    description: 'Sort / display order',
    default: 0,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;

  @ApiPropertyOptional({
    description: 'Whether this image should be set as the primary image',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;
}
