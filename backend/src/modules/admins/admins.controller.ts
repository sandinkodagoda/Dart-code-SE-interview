import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all admin users (Super Admin only)',
    description: 'Retrieves paginated list of all system administrative accounts.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Admin accounts list' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.adminsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get admin user by ID (Super Admin only)',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Admin user details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Admin not found' })
  async findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new admin user (Super Admin only)',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Admin created' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists' })
  async create(
    @Body() dto: CreateAdminDto,
    @CurrentUser('id') creatorId: string,
  ) {
    return this.adminsService.create(dto, creatorId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update admin user (Super Admin only)',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Admin updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Admin not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.adminsService.update(id, dto, actorId);
  }
}
