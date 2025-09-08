/* eslint-disable prettier/prettier */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const configService = new ConfigService();
  const port = configService.get<number>('PORT') || 3000;
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  // set cookie parser
  app.use(cookieParser());
  // set cors
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    credentials: true,
  });

  // Đặt prefix cho tất cả các route là 'api'
  app.setGlobalPrefix('api', { exclude: [''] });

  // Bật versioning, endpoint sẽ có dạng: /api/v1/...
  app.enableVersioning({ defaultVersion: '1', type: VersioningType.URI });

  // Sử dụng ValidationPipe để validate dữ liệu đầu vào
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);
  // Thông báo endpoint mẫu cho người dùng
  console.log(`Server is running on http://localhost:${port}/api/v1/users`);
  console.log('Ví dụ: GET http://localhost:' + port + '/api/v1/users');
}

bootstrap();
