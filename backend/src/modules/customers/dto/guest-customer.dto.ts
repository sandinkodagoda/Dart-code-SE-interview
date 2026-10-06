import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GuestCustomerDto {
  @ApiProperty({
    description: 'Customer full name',
    example: 'Kamal Perera',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'kamal.perera@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Customer contact phone number',
    example: '0771234567',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+0-9\s-]{7,20}$/, {
    message: 'Phone number must contain between 7 and 20 digits/valid characters',
  })
  phone: string;
}
