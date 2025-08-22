import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
// Xử lý đăng nhập với email/password
// - Nhận email và password từ client
// - Gọi AuthService.validateUser() để kiểm tra
// - Trả về user nếu hợp lệ, ngược lại throw exception
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Username/password is incorrect');
    }
    return user;
  }
}
