import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customize.jwt-auth.guard';
import { CreateAuthDto, ForgotPasswordDto } from './dto/create-auth.dto';
import { CodeAuthDto, ResendCodeDto, RetryCodeDto } from './dto/mail-dto';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login success')
  @Post('login')
  HandleLogin(@Request() req) {
    return this.authService.login(req.user);
  }
  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log(req.user);
    return req.user;
  }
  @Public()
  @Post('register')
  HandleRegister(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }
  @Public()
  @Get('send-mail')
  HandleSendMail() {
    return this.mailerService.sendMail({
      to: 'nguyentan28042000@gmail.com',
      subject: 'Test Mail mailer',
      text: 'Test Mail mailer',
      template: 'register',
      context: {
        name: 'Nguyen Tan',
        activationCode: '123456',
      },
    });
  }
  @Public()
  @Post('check-code')
  HandleSendMailOtp(@Body() codeAuthDto: CodeAuthDto) {
    return this.authService.CheckCodeAuth(codeAuthDto);
  }

  @Public()
  @Post('resend-mail-otp')
  HandleResendMailOtp(@Body() resendCodeDto: ResendCodeDto) {
    return this.authService.ResendCode(resendCodeDto);
  }
  @Public()
  @Post('retry-mail-otp')
  HandleRetryMailOtp(@Body() retryCodeDto: RetryCodeDto) {
    return this.authService.RetryCode(retryCodeDto);
  }
  @Public()
  @Post('forgot-password')
  HandleForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.ForgotPassword(forgotPasswordDto);
  }
}
