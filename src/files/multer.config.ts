import { Injectable } from '@nestjs/common';
import { MulterOptionsFactory } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterOptions {
    // Đảm bảo thư mục uploads tồn tại
    this.ensureExistDir('./uploads');

    return {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads';
          this.ensureExistDir(uploadPath);
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          // Tạo tên file unique với timestamp và random string
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtension = path.extname(file.originalname);
          const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
          callback(null, fileName);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
        files: 10, // Tối đa 10 files
      },
      fileFilter: (req, file, callback) => {
        // Kiểm tra loại file được phép upload
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('File type not allowed'), false);
        }
      },
    };
  }

  getRootPath(): string {
    return process.cwd();
  }

  ensureExistDir(dir: string): void {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Directory ${dir} created successfully`);
      } else {
        console.log(`Directory ${dir} already exists`);
      }
    } catch (error) {
      console.error(`Failed to create directory ${dir}:`, error);
      throw new Error(`Cannot create directory: ${dir}`);
    }
  }

  getUploadPath(subDir?: string): string {
    const uploadPath = path.join(this.getRootPath(), 'uploads');
    if (subDir) {
      const fullPath = path.join(uploadPath, subDir);
      this.ensureExistDir(fullPath);
      return fullPath;
    }
    return uploadPath;
  }
}
