import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin login',
    description:
      'Authenticates an administrative user and returns a signed JWT access token. Rate limited to 5 attempts per minute.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials or deactivated account',
  })
  async login(
    @Body() dto: AdminLoginDto,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    const ipAddress =
      (request.headers['x-forwarded-for'] as string) || request.socket.remoteAddress;
    const userAgent = request.headers['user-agent'];
    return this.authService.login(dto, ipAddress, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current authenticated admin profile',
    description: 'Returns the sanitized profile of the logged-in administrator.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin profile retrieved',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid token',
  })
  async getProfile(@CurrentUser('id') adminId: string) {
    return this.authService.getProfile(adminId);
  }
}
