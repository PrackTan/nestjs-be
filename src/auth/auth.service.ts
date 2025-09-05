import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto, ForgotPasswordDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '@/modules/users/users.service';
import { comparePassword } from '@/utils/helpers';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/types/TypeUser';
import { MailService } from '@/mail/mail.service';
import {
  CodeAuthDto,
  ResendCodeDto,
  RetryCodeDto,
  SendForgotPasswordMailDto,
} from './dto/mail-dto';
import { InvalidVerificationCodeException } from '@/core/global-exeptions';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findbyEmail(email);
    if (!user) return null;
    if (user.isActive === false) {
      throw new InvalidVerificationCodeException();
    }
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Username/password is incorrect');
    }
    return user;
  }
  async login(user: User, res: Response): Promise<any> {
    const { _id, email, name, role } = user;
    const payload = {
      sub: _id,
      iss: 'from server',
      user: {
        _id: _id,
        email: email,
        name: name,
        role: role,
      },
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.createRefreshToken(payload);
    // update refresh token in user
    console.log('Updating refresh token for user:', _id);
    console.log('Refresh token:', refreshToken);
    const updateResult = await this.usersService.updateRefreshToken(
      _id,
      refreshToken,
    );
    console.log('Update result:', updateResult);
    // set refresh token in cookies
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED')),
    });
    return {
      access_token: accessToken,
      user: {
        _id: _id,
        email: email,
        name: name,
        role: role,
      },
    };
  }
  async register(createAuthDto: CreateAuthDto) {
    const user = await this.usersService.findbyEmail(createAuthDto.email);
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    return this.usersService.register(createAuthDto);
  }
  createRefreshToken(payload) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED'),
    });
    return refreshToken;
  }
  async sendTestMail() {
    return this.mailService.sendActivationMail({
      to: 'nguyentan28042000@gmail.com',
      name: 'Nguyen Tan',
      activationCode: '123456',
    });
  }
  async CheckCodeAuth(codeAuthDto: CodeAuthDto) {
    return await this.usersService.handleCheckcode(codeAuthDto);
  }

  async ResendCode(codeDto: ResendCodeDto) {
    return await this.usersService.resendActivationCode(codeDto);
  }
  async RetryCode(retryCodeDto: RetryCodeDto) {
    return await this.usersService.retryActivationCode(retryCodeDto);
  }
  async ForgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return await this.usersService.forgotPassword(forgotPasswordDto);
  }
  async sendForgotPasswordMail(
    sendForgotPasswordMailDto: SendForgotPasswordMailDto,
  ) {
    return await this.usersService.sendForgotPasswordMail(
      sendForgotPasswordMailDto,
    );
  }
}
