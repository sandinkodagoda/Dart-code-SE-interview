import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminsService {
  private readonly logger = new Logger(AdminsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.adminUser.count({ where }),
      this.prisma.adminUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
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
      throw new NotFoundException(`Admin with ID '${id}' not found`);
    }

    return admin;
  }

  async create(dto: CreateAdminDto, creatorId?: string) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException(
        `Admin with email '${dto.email}' already exists`,
      );
    }

    const passwordHash = await argon2.hash(dto.password);

    const created = await this.prisma.adminUser.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        role: dto.role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: creatorId || null,
          action: 'ADMIN_CREATED',
          entityType: 'AdminUser',
          entityId: created.id,
          newValue: { name: created.name, email: created.email, role: created.role },
        },
      });
    } catch (err) {
      this.logger.warn('Failed to write audit log for admin creation', err);
    }

    return created;
  }

  async update(id: string, dto: UpdateAdminDto, actorId?: string) {
    await this.findOne(id);

    const data: any = {};
    if (dto.name) data.name = dto.name.trim();
    if (dto.role) data.role = dto.role;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) {
      data.passwordHash = await argon2.hash(dto.password);
    }

    const updated = await this.prisma.adminUser.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: actorId || null,
          action: 'ADMIN_UPDATED',
          entityType: 'AdminUser',
          entityId: id,
          newValue: data,
        },
      });
    } catch (err) {
      this.logger.warn('Failed to write audit log for admin update', err);
    }

    return updated;
  }
}
