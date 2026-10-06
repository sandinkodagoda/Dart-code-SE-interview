import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

export interface ProcessImageOptions {
  square?: boolean;
  width?: number;
  height?: number;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly baseUploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUploadDir = path.resolve(
      process.cwd(),
      this.configService.get<string>('uploads.uploadDir', './uploads'),
    );
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  /**
   * Process uploaded image, convert to WebP, and save to uploads folder.
   */
  async processAndSaveImage(
    file: Express.Multer.File,
    folder: string = 'general',
    options: ProcessImageOptions = {},
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No image file provided');
    }

    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/tiff',
      'image/avif',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file format: ${file.mimetype}. Allowed formats: JPG, PNG, WEBP, GIF, AVIF`,
      );
    }

    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '') || 'general';
    const targetDir = path.join(this.baseUploadDir, sanitizedFolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const filename = `${sanitizedFolder}_${timestamp}_${randomStr}.webp`;
    const targetFilePath = path.join(targetDir, filename);

    let imagePipeline = sharp(file.buffer);
    const metadata = await imagePipeline.metadata();

    if (options.square) {
      const size =
        options.width ||
        (metadata.width && metadata.height
          ? Math.min(metadata.width, metadata.height, 1200)
          : 800);
      imagePipeline = imagePipeline.resize(size, size, {
        fit: 'cover',
        position: 'center',
      });
    } else if (options.width || options.height) {
      imagePipeline = imagePipeline.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const webpBuffer = await imagePipeline
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    await fs.promises.writeFile(targetFilePath, webpBuffer);
    this.logger.log(`Saved WebP image: ${targetFilePath} (${webpBuffer.length} bytes)`);

    const relativeUrl = `/uploads/${sanitizedFolder}/${filename}`;
    const backendPort = this.configService.get<number>('app.port', 5000);
    const fullUrl = `http://localhost:${backendPort}${relativeUrl}`;

    return {
      url: relativeUrl,
      fullUrl,
      filename,
      format: 'webp',
      size: webpBuffer.length,
      originalName: file.originalname,
      isSquare: !!options.square,
    };
  }
}
