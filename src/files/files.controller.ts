import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UploadedFiles,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CloudUploadService } from './cloud-upload.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly cloudUploadService: CloudUploadService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
        .addFileTypeValidator({
          fileType:
            /^(jpg|jpeg|png|image\/jpeg|image\/png|image\/gif|image\/webp|pdf|application\/pdf|txt|doc|docx|text\/plain)$/i,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const result = await this.filesService.saveFile(file);
      return {
        success: true,
        message: 'File uploaded successfully',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException('File upload failed: ' + error.message);
    }
  }
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Giới hạn tối đa 10 files
  async uploadMultipleFiles(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 }) // 5MB per file
        .addFileTypeValidator({
          fileType:
            /^(jpg|jpeg|png|image\/jpeg|image\/png|image\/gif|image\/webp|pdf|application\/pdf|txt|doc|docx|text\/plain)$/i,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Express.Multer.File[],
  ) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided');
      }

      const results = await this.filesService.saveMultipleFiles(files);
      return {
        success: true,
        message: `${files.length} files uploaded successfully`,
        data: results,
        totalFiles: files.length,
      };
    } catch (error) {
      throw new BadRequestException(
        'Multiple files upload failed: ' + error.message,
      );
    }
  }

  // Endpoint để serve static files
  @Get('serve/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const filePath = await this.filesService.getFilePath(filename);
      return res.sendFile(filePath);
    } catch (error) {
      throw new BadRequestException('File not found');
    }
  }

  // Endpoint để lấy thông tin file
  @Get('info/:filename')
  async getFileInfo(@Param('filename') filename: string) {
    try {
      const filePath = await this.filesService.getFilePath(filename);
      return {
        success: true,
        message: 'File found',
        data: {
          filename: filename,
          path: filePath,
        },
      };
    } catch (error) {
      throw new BadRequestException('File not found');
    }
  }

  // Endpoint để xóa file
  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    try {
      await this.filesService.deleteFile(filename);
      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('File deletion failed: ' + error.message);
    }
  }

  // ==================== CLOUD UPLOAD ROUTES ====================

  // Upload single file to Cloudinary
  @Post('upload-cloudinary')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToCloudinary(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 10 }) // 10MB for cloud
        .addFileTypeValidator({
          fileType:
            /^(jpg|jpeg|png|image\/jpeg|image\/png|image\/gif|image\/webp|pdf|application\/pdf|txt|doc|docx|text\/plain|video\/mp4|video\/mov|video\/avi)$/i,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const result = await this.cloudUploadService.uploadToCloudinary(file);
      return {
        success: true,
        message: 'File uploaded to Cloudinary successfully',
        provider: 'cloudinary',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        'Cloudinary upload failed: ' + error.message,
      );
    }
  }

  // Upload multiple files to Cloudinary
  @Post('upload-cloudinary-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleToCloudinary(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 10 })
        .addFileTypeValidator({
          fileType:
            /^(jpg|jpeg|png|image\/jpeg|image\/png|image\/gif|image\/webp|pdf|application\/pdf|txt|doc|docx|text\/plain|video\/mp4|video\/mov|video\/avi)$/i,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Express.Multer.File[],
  ) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided');
      }

      const results =
        await this.cloudUploadService.uploadMultipleToCloudinary(files);
      return {
        success: true,
        message: `${files.length} files uploaded to Cloudinary successfully`,
        provider: 'cloudinary',
        data: results,
        totalFiles: files.length,
      };
    } catch (error) {
      throw new BadRequestException(
        'Cloudinary multiple upload failed: ' + error.message,
      );
    }
  }

  // Upload single file to AWS S3
  @Post('upload-s3')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToS3(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 50 }) // 50MB for S3
        .addFileTypeValidator({
          fileType:
            /^(jpg|jpeg|png|image\/jpeg|image\/png|image\/gif|image\/webp|pdf|application\/pdf|txt|doc|docx|text\/plain|video\/mp4|video\/mov|video\/avi|zip|rar)$/i,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const result = await this.cloudUploadService.uploadToS3(file);
      return {
        success: true,
        message: 'File uploaded to AWS S3 successfully',
        provider: 'aws-s3',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException('S3 upload failed: ' + error.message);
    }
  }

  // Upload multiple files to AWS S3
  @Post('upload-s3-multiple')
  @UseInterceptors(FilesInterceptor('files', 20)) // S3 có thể handle nhiều files hơn
  async uploadMultipleToS3(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 50 })
        .addFileTypeValidator({
          fileType:
            /^(jpg|jpeg|png|image\/jpeg|image\/png|image\/gif|image\/webp|pdf|application\/pdf|txt|doc|docx|text\/plain|video\/mp4|video\/mov|video\/avi|zip|rar)$/i,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Express.Multer.File[],
  ) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided');
      }

      const results = await this.cloudUploadService.uploadMultipleToS3(files);
      return {
        success: true,
        message: `${files.length} files uploaded to AWS S3 successfully`,
        provider: 'aws-s3',
        data: results,
        totalFiles: files.length,
      };
    } catch (error) {
      throw new BadRequestException(
        'S3 multiple upload failed: ' + error.message,
      );
    }
  }
}
