import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CloudUploadService } from './cloud-upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './multer.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MulterModule.registerAsync({ useClass: MulterConfigService }),
    ConfigModule,
  ],
  controllers: [FilesController],
  providers: [FilesService, CloudUploadService, MulterConfigService],
  exports: [FilesService, CloudUploadService],
})
export class FilesModule {}
