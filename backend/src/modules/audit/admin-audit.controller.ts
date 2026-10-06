import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
@Controller('admin/audit-logs')
export class AdminAuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({
    summary: 'List and filter administrative audit logs',
    description:
      'Returns a paginated list of system audit logs, including administrative actions on auth, catalog, orders, stock adjustments, and settings.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated audit logs retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid admin JWT required.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires ADMIN or SUPER_ADMIN role.',
  })
  findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get audit log details by ID',
    description: 'Retrieves complete payload diff and metadata for a specific audit log entry.',
  })
  @ApiParam({
    name: 'id',
    description: 'Audit log UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit log details retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Audit log entry not found.',
  })
  findById(@Param('id') id: string) {
    return this.auditService.findById(id);
  }
}
