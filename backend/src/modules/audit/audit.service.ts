import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuditQueryDto } from './dto/audit-query.dto';

export interface CreateAuditLogParams {
  adminId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Safely records an audit log entry.
   * Strips sensitive data like passwords or tokens. Never throws to avoid blocking business operations.
   */
  async log(params: CreateAuditLogParams): Promise<void> {
    try {
      const sanitizedPrevious = this.sanitizeData(params.previousValue);
      const sanitizedNew = this.sanitizeData(params.newValue);

      await this.prisma.auditLog.create({
        data: {
          adminId: params.adminId ?? null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId ?? null,
          previousValue: sanitizedPrevious !== undefined ? sanitizedPrevious : Prisma.JsonNull,
          newValue: sanitizedNew !== undefined ? sanitizedNew : Prisma.JsonNull,
          ipAddress: params.ipAddress ?? null,
          userAgent: params.userAgent ?? null,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to create audit log for action: ${params.action}`, error);
    }
  }

  /**
   * Admin: Retrieves paginated and filtered audit logs
   */
  async findAll(query: AuditQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (query.action) {
      where.action = {
        contains: query.action,
        mode: 'insensitive',
      };
    }

    if (query.entityType) {
      where.entityType = {
        equals: query.entityType,
        mode: 'insensitive',
      };
    }

    if (query.adminId) {
      where.adminId = query.adminId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Retrieves details of a specific audit log by ID
   */
  async findById(id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      throw new NotFoundException(`Audit log entry with ID '${id}' was not found`);
    }

    return log;
  }

  /**
   * Helper: Sanitizes sensitive fields from object payloads before persisting to audit log
   */
  private sanitizeData(data: any): any {
    if (!data) return data;
    if (typeof data !== 'object') return data;

    const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'merchantSecret', 'authorization'];

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
