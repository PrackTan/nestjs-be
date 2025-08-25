import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { MailModule } from '@/mail/mail.module';

@Module({
  // Danh sách các module được import vào AuthModule
  imports: [
    // Import UsersModule để sử dụng các service liên quan đến user
    UsersModule,
    // Import MailModule để sử dụng dịch vụ gửi email (activation, forgot password, etc.)
    MailModule,
    // Cấu hình JWT module một cách bất đồng bộ
    JwtModule.registerAsync({
      // Import ConfigModule để truy cập các biến môi trường
      imports: [ConfigModule],
      // Đánh dấu module này có thể sử dụng global trong toàn bộ ứng dụng
      global: true,
      // Factory function để tạo cấu hình JWT
      useFactory: async (configService: ConfigService) => ({
        // Lấy JWT secret key từ biến môi trường JWT_SECRET
        secret: configService.get<string>('JWT_SECRET'),
        // Cấu hình các options cho việc ký token
        signOptions: {
          // Thời gian hết hạn của access token, lấy từ biến môi trường
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED'),
        },
      }),
      // Inject ConfigService để sử dụng trong useFactory
      inject: [ConfigService],
    }),
    // Import PassportModule để sử dụng các authentication strategy
    PassportModule,
  ],
  // Danh sách các controller thuộc về module này
  controllers: [AuthController],
  // Danh sách các provider (service, strategy) được đăng ký trong module
  providers: [
    AuthService, // Service chính xử lý logic authentication
    LocalStrategy, // Strategy cho việc đăng nhập bằng email/password
    JwtStrategy, // Strategy cho việc xác thực JWT token
  ],
})
export class AuthModule {}
