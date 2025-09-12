import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import * as path from 'path';
import * as fs from 'fs';

export interface FileUploadResponse {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  uploadedAt: Date;
}

@Injectable()
export class FilesService {
  private readonly uploadPath = './uploads';

  async saveFile(file: Express.Multer.File): Promise<FileUploadResponse> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `${baseUrl}/files/serve/${file.filename}`,
      uploadedAt: new Date(),
    };
  }

  async saveMultipleFiles(
    files: Express.Multer.File[],
  ): Promise<FileUploadResponse[]> {
    const results: FileUploadResponse[] = [];

    for (const file of files) {
      const result = await this.saveFile(file);
      results.push(result);
    }

    return results;
  }

  async getFilePath(filename: string): Promise<string> {
    const filePath = path.join(process.cwd(), this.uploadPath, filename);

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return filePath;
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(process.cwd(), this.uploadPath, filename);

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    // Xóa file
    fs.unlinkSync(filePath);
  }

  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
  }

  findAll() {
    return `This action returns all files`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
