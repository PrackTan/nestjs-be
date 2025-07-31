/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const configService = new ConfigService();
  const port = configService.get<number>('PORT') || 3000;
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setGlobalPrefix('api', { exclude: [''] });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api',
  });
  // Sử dụng ValidationPipe với các tùy chọn:
  // - whitelist: true => Chỉ cho phép các thuộc tính được định nghĩa trong DTO, các thuộc tính dư thừa sẽ bị loại bỏ.
  // - transform: true => Tự động chuyển đổi kiểu dữ liệu đầu vào thành kiểu dữ liệu mong muốn trong DTO (ví dụ: chuyển chuỗi sang số).
  // - forbidNonWhitelisted: true => Ném lỗi nếu có thuộc tính không được phép trong DTO.
  // - forbidUnknownValues: true => Ném lỗi nếu có thuộc tính không được phép trong DTO.
  // - disableErrorMessages: true => Vô hiệu hóa các thông báo lỗi chi tiết.
  // - exceptionFactory: (errors) => new BadRequestException(errors), => Tùy chỉnh hàm xử lý lỗi.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);
}
bootstrap();
