import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    dto: AdminLoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account has been deactivated');
    }

    const isPasswordValid = await argon2.verify(
      admin.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const now = new Date();

    // Update lastLoginAt
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: now },
    });

    // Record audit log for login
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: 'ADMIN_LOGIN',
          entityType: 'AdminUser',
          entityId: admin.id,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });
    } catch (auditErr) {
      this.logger.warn('Failed to record login audit log', auditErr);
    }

    // Sign JWT
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLoginAt: now,
        createdAt: admin.createdAt,
      },
    };
  }

  async getProfile(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin user not found');
    }

    return admin;
  }
}
