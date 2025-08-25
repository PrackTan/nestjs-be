/**
 * File này chứa các decorator tùy chỉnh để hỗ trợ JWT authentication và response message
 */

import { SetMetadata } from '@nestjs/common';

// Định nghĩa key để đánh dấu một endpoint là public (không cần xác thực)
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator @Public() - Đánh dấu endpoint không cần xác thực JWT
 *
 * Cách sử dụng:
 * @Public()
 * @Get('login')
 * login() { ... }
 *
 * Khi sử dụng decorator này, endpoint sẽ bỏ qua việc kiểm tra JWT token
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Định nghĩa key để lưu trữ message tùy chỉnh cho response
export const RESPONSE_MESSAGE = 'response_message';

/**
 * Decorator @ResponseMessage() - Gắn message tùy chỉnh cho response
 *
 * @param message - Thông điệp muốn gắn vào response
 *
 * Cách sử dụng:
 * @ResponseMessage('Đăng nhập thành công')
 * @Post('login')
 * login() { ... }
 *
 * Message này sẽ được TransformInterceptor sử dụng để tạo response chuẩn hóa
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);
