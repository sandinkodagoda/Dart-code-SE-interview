import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Uploads')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload and convert image to WebP (Admin)',
    description:
      'Uploads an image, converts it into an optimized WebP file, and saves it into the backend uploads folder.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload (JPEG, PNG, WebP, etc.)',
        },
      },
    },
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    description: 'Subfolder for image categorization (e.g. products, categories)',
    example: 'products',
  })
  @ApiQuery({
    name: 'isSquare',
    required: false,
    description: 'Enforce 1:1 square aspect ratio (ideal for products)',
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Image uploaded and converted to WebP successfully',
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
    @Query('isSquare') isSquare?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Please provide an image file');
    }

    const enforceSquare = isSquare === 'true' || isSquare === '1';
    return this.uploadsService.processAndSaveImage(
      file,
      folder || 'general',
      { square: enforceSquare },
    );
  }
}
