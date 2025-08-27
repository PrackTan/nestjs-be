import { IS_PUBLIC_KEY } from '@/decorator/customize.jwt-auth.guard';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Đoạn code dưới đây định nghĩa class JwtAuthGuard, kế thừa từ AuthGuard('jwt') của NestJS.
   * Mục đích của class này là bảo vệ các route bằng cách xác thực JWT (JSON Web Token).
   *
   * 1. Constructor:
   *    - Nhận vào một đối tượng Reflector (được NestJS cung cấp) để truy xuất metadata của route.
   *    - Gọi super() để khởi tạo AuthGuard gốc.
   *
   * 2. Phương thức canActivate(context: ExecutionContext):
   *    - Được gọi mỗi khi một route được bảo vệ bởi JwtAuthGuard này được truy cập.
   *    - Sử dụng Reflector để kiểm tra xem route hoặc controller có được đánh dấu là "public" (không cần xác thực) hay không thông qua metadata IS_PUBLIC_KEY.
   *    - Nếu route là public (isPublic = true), trả về true, cho phép truy cập mà không cần xác thực JWT.
   *    - Nếu không phải public, gọi super.canActivate(context) để thực hiện xác thực JWT như mặc định.
   *    - Có thể mở rộng phương thức này để bổ sung logic kiểm tra quyền, logging, hoặc các xử lý khác trước/sau khi xác thực.
   *
   * 3. Phương thức handleRequest(err, user, info):
   *    - Được gọi sau khi quá trình xác thực JWT hoàn tất.
   *    - Nếu có lỗi (err) hoặc không tìm thấy user (user == null/undefined), sẽ ném ra UnauthorizedException với thông báo "Access Token is invalid or expired".
   *    - Nếu xác thực thành công, trả về đối tượng user đã được giải mã từ JWT.
   *    - Phương thức này cho phép tùy biến cách xử lý lỗi hoặc trả về user sau khi xác thực.
   */

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Kiểm tra xem route hoặc controller có được đánh dấu là public không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // Nếu là public, cho phép truy cập mà không cần xác thực
      return true;
    }
    // Nếu không, thực hiện xác thực JWT như mặc định
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Nếu có lỗi hoặc không tìm thấy user, ném ra UnauthorizedException
    if (err || !user) {
      throw (
        err || new UnauthorizedException('Access Token is not have in body')
      );
    }
    // Nếu xác thực thành công, trả về user
    return user;
  }
}
