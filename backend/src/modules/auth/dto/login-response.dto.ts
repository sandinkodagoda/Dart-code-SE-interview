import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';

export class AdminUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: AdminRole })
  role: AdminRole;

  @ApiProperty({ nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Authenticated admin profile' })
  admin: AdminUserResponseDto;
}
