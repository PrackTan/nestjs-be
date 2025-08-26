/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LikesModule } from '@/modules/likes/likes.module';
import { UsersModule } from '@/modules/users/users.module';
import { MenuItemOptionsModule } from '@/modules/menu.item.options/menu.item.options.module';
import { MenuItemsModule } from '@/modules/menu.items/menu.items.module';
import { MenusModule } from '@/modules/menus/menus.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { OrderDetail } from '@/modules/order.detail/schemas/order.detail.schema';
import { RestaurantsModule } from '@/modules/restaurants/restaurants.module';
import { ReviewsModule } from '@/modules/reviews/reviews.module';
import { TicketModule } from '@/ticket/ticket.module';
import { AuthModule } from '@/auth/auth.module';
import { MailModule } from '@/mail/mail.module';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TransformInterceptor } from '@/core/transform.interceptor';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { CategoryModule } from '@/modules/category/category.module';
/**
 * AppModule - Module gốc của ứng dụng NestJS
 *
 * Module này là nơi tập hợp tất cả các module con, cấu hình database,
 * email service và các provider toàn cục cho ứng dụng.
 */
@Module({
  imports: [
    // === CÁC MODULE CHỨC NĂNG CHÍNH ===
    UsersModule, // Module quản lý người dùng
    LikesModule, // Module quản lý tính năng like/unlike
    MenuItemOptionsModule, // Module quản lý các tùy chọn của món ăn (size, topping, etc.)
    MenuItemsModule, // Module quản lý các món ăn
    MenusModule, // Module quản lý menu của nhà hàng
    OrdersModule, // Module quản lý đơn hàng
    OrderDetail, // Module quản lý chi tiết đơn hàng
    RestaurantsModule, // Module quản lý nhà hàng
    ReviewsModule, // Module quản lý đánh giá/review
    TicketModule, // Module quản lý ticket/phiếu hỗ trợ
    AuthModule, // Module xác thực người dùng (login, register, JWT)
    MailModule, // Module gửi email tùy chỉnh

    // === CẤU HÌNH TOÀN CỤC ===
    // Cấu hình biến môi trường có thể sử dụng toàn bộ ứng dụng
    ConfigModule.forRoot({ isGlobal: true }),

    // === CẤU HÌNH DATABASE MONGODB ===
    // Kết nối MongoDB sử dụng Mongoose một cách bất đồng bộ
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      // Factory function để tạo cấu hình kết nối database
      useFactory: async (configService: ConfigService) => ({
        // Lấy URI kết nối MongoDB từ biến môi trường MONGODB_URI
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    // === CẤU HÌNH DỊCH VỤ GỬI EMAIL ===
    // Cấu hình MailerModule để gửi email qua SMTP
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // Cấu hình SMTP transport
        transport: {
          host: configService.get<string>('MAIL_HOST'), // Host SMTP (vd: smtp.gmail.com)
          port: configService.get<number>('MAIL_PORT'), // Port SMTP (thường là 587 hoặc 465)
          ignoreTLS: false, // Không bỏ qua TLS
          secure: true, // Sử dụng kết nối bảo mật
          auth: {
            user: configService.get<string>('MAIL_USER'), // Email đăng nhập SMTP
            pass: configService.get<string>('MAIL_PASSWORD'), // Mật khẩu SMTP
          },
          tls: {
            rejectUnauthorized: false, // Cho phép chứng chỉ tự ký
          },
          connectionTimeout: 60000, // Timeout kết nối (60 giây)
          greetingTimeout: 30000, // Timeout chào hỏi (30 giây)
        },
        // Cấu hình mặc định cho email
        defaults: {
          from: `"No Reply" <${configService.get<string>('MAIL_USER')}>`, // Địa chỉ gửi mặc định
        },
        // preview: true,                                         // Bật preview email (dùng cho dev)
        // Cấu hình template engine cho email
        template: {
          dir: process.cwd() + '/src/mail/templates/', // Thư mục chứa template email
          adapter: new HandlebarsAdapter(), // Sử dụng Handlebars làm template engine
          options: {
            strict: true, // Chế độ strict cho Handlebars
          },
        },
      }),
      inject: [ConfigService],
    }),

    CategoryModule,
  ],
  controllers: [AppController], // Controller gốc của ứng dụng
  providers: [
    AppService, // Service gốc của ứng dụng

    // === GLOBAL GUARD ===
    // Đăng ký JwtAuthGuard làm guard toàn cục
    // Tất cả các endpoint sẽ yêu cầu JWT token trừ khi được đánh dấu @Public()

    // === GLOBAL INTERCEPTOR ===
    // Đăng ký TransformInterceptor làm interceptor toàn cục
    // Chuyển đổi format response thành dạng chuẩn cho toàn bộ ứng dụng
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
