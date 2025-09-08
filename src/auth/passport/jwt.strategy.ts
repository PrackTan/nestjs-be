import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayloadUser, User } from 'src/types/TypeUser';
// Xử lý xác thực JWT token
// - Extract token từ Authorization header (Bearer token)
// - Verify token với JWT_SECRET
// - Trả về user info từ payload (id, email)
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: PayloadUser) {
    const { _id, email, name, role } = payload.user;
    // request.user have informations
    return { _id: _id, email: email, name: name, role: role };
  }
}
