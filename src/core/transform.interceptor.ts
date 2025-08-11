/**
 * TransformInterceptor là một interceptor dùng để chuẩn hóa cấu trúc response trả về từ các controller trong NestJS.
 *
 * 1. Mục đích:
 *    - Đảm bảo mọi response trả về đều có cấu trúc thống nhất gồm: statusCode, message, data.
 *    - Cho phép gắn message tuỳ biến cho từng route thông qua metadata RESPONSE_MESSAGE.
 *
 * 2. Các thành phần chính:
 *    - interface Response<T>: Định nghĩa kiểu dữ liệu trả về gồm statusCode, message (tùy chọn), data.
 *    - @Injectable(): Đánh dấu class có thể được inject vào các nơi khác trong NestJS.
 *    - constructor(private reflector: Reflector): Inject Reflector để lấy metadata của route handler.
 *
 * 3. Phương thức intercept:
 *    - context: Chứa thông tin về request hiện tại (route, handler, request, response, ...).
 *    - next: Cho phép tiếp tục xử lý request (gọi handler tiếp theo).
 *    - return next.handle().pipe(map(...)): Lấy dữ liệu trả về từ handler, sau đó "map" lại thành object chuẩn hóa.
 *    - statusCode: Lấy status code hiện tại của response.
 *    - message: Lấy message từ metadata RESPONSE_MESSAGE nếu có, nếu không thì trả về chuỗi rỗng.
 *    - data: Dữ liệu thực tế trả về từ handler.
 *
 * 4. Cách sử dụng:
 *    - Đăng ký interceptor này ở global hoặc cho từng controller/route.
 *    - Có thể gắn message cho từng route bằng decorator @ResponseMessage('...').
 */

import { RESPONSE_MESSAGE } from '@/decorator/customize.jwt-auth.guard';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Định nghĩa interface cho response chuẩn hóa
export interface Response<T> {
  statusCode: number;
  message?: string;
  data: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  // Inject Reflector để lấy metadata từ handler
  constructor(private reflector: Reflector) {}

  // intercept: can thiệp vào quá trình xử lý request/response
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    // Xử lý dữ liệu trả về từ handler
    return next.handle().pipe(
      map((data) => ({
        // Lấy status code hiện tại của response
        statusCode: context.switchToHttp().getResponse().statusCode,
        // Lấy message từ metadata nếu có, nếu không thì trả về ''
        message:
          this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ||
          '',
        // Dữ liệu thực tế trả về từ handler
        data: data,
      })),
    );
  }
}
