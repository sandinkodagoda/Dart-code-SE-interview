import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerAddressDto {
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
}
