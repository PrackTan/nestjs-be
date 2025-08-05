import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '@/modules/users/users.service';
import { comparePassword } from '@/utils/helpers';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/types/TypeUser';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findbyEmail(email);
    if (!user) {
      throw new UnauthorizedException('Username/password is incorrect');
    }
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Username/password is incorrect');
    }
    return user;
  }
  async login(user: User): Promise<any> {
    const payload = {
      sub: user._id,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      access_token: accessToken,
    };
  }
  async register(createAuthDto: CreateAuthDto) {
    const user = await this.usersService.findbyEmail(createAuthDto.email);
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    return this.usersService.register(createAuthDto);
  }
}
