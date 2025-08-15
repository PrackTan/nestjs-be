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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
  async login(user: User): Promise<any> {
    const payload = {
      sub: user._id,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
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
