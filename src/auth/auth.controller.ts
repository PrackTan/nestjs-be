/**
 * AuthController - Controller xử lý các endpoint liên quan đến xác thực người dùng
 *
 * Controller này chứa các API endpoints cho việc đăng nhập, đăng ký, quên mật khẩu,
 * xác thực email và các chức năng liên quan đến authentication.
 */
import {
  Controller,
  Post,
  UseGuards,
  Get,
  Body,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customize.jwt-auth.guard';
import { CreateAuthDto, ForgotPasswordDto } from './dto/create-auth.dto';
import {
  CodeAuthDto,
  ResendCodeDto,
  RetryCodeDto,
  SendForgotPasswordMailDto,
} from './dto/mail-dto';
import { Request, Response } from 'express';
import { RUser } from '@/decorator/customize.request';
import { User } from '@/modules/users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint đăng nhập người dùng
   *
   * @Public() - Cho phép truy cập công khai, không cần JWT token
   * @UseGuards(LocalAuthGuard) - Sử dụng LocalAuthGuard để xác thực email/password
   * @ResponseMessage - Decorator tùy chỉnh để thêm message vào response
   *
   * LocalAuthGuard sẽ tự động validate email/password thông qua LocalStrategy,
   * nếu thành công thì user sẽ được attach vào req.user
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login success')
  @Post('login')
  HandleLogin(@Req() req, @Res({ passthrough: true }) res: Response) {
    // Gọi service để tạo JWT token và trả về thông tin user
    return this.authService.login(req.user, res);
  }
  @Post('logout')
  HandleLogout(
    @Res({ passthrough: true }) response: Response,
    @RUser() user: any,
  ) {
    return this.authService.logout(user, response);
  }
  /**
   * Endpoint lấy thông tin profile của user đã đăng nhập
   *
   * Endpoint này được bảo vệ bởi JwtAuthGuard (global guard)
   * User phải cung cấp valid JWT token trong header Authorization
   */
  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    // req.user chứa thông tin user được giải mã từ JWT token
    console.log(req.user);
    return req.user;
  }

  @Get('account')
  handleGetAccount(@RUser() user: any) {
    return user;
  }
  @Public()
  @ResponseMessage('Refresh token success')
  @Get('refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(request.cookies);
    const refreshToken = request.cookies['refresh_token'];
    // console.log(refreshToken);
    return this.authService.processRefreshToken(refreshToken, res);
  }
  /**
   * Endpoint đăng ký tài khoản mới
   *
   * @Public() - Cho phép truy cập công khai
   * Nhận thông tin đăng ký từ body request và tạo tài khoản mới
   */
  @Public()
  @Post('register')
  HandleRegister(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  /**
   * Endpoint test gửi email (có thể dùng cho testing)
   *
   * @Public() - Cho phép truy cập công khai
   * Gửi email test đến địa chỉ cố định để kiểm tra chức năng gửi mail
   */
  @Public()
  @Get('send-mail')
  HandleSendMail() {
    return this.authService.sendTestMail();
  }

  /**
   * Endpoint xác thực mã OTP
   *
   * @Public() - Cho phép truy cập công khai
   * Nhận mã OTP từ user và kiểm tra tính hợp lệ
   * Thường được sử dụng sau khi user đăng ký để active tài khoản
   */
  @Public()
  @Post('check-code')
  HandleSendMailOtp(@Body() codeAuthDto: CodeAuthDto) {
    return this.authService.CheckCodeAuth(codeAuthDto);
  }

  /**
   * Endpoint gửi lại mã OTP
   *
   * @Public() - Cho phép truy cập công khai
   * Khi user không nhận được mã OTP hoặc mã đã hết hạn,
   * có thể sử dụng endpoint này để gửi lại mã mới
   */
  @Public()
  @Post('resend-mail-otp')
  HandleResendMailOtp(@Body() resendCodeDto: ResendCodeDto) {
    return this.authService.ResendCode(resendCodeDto);
  }

  /**
   * Endpoint thử lại gửi mã OTP
   *
   * @Public() - Cho phép truy cập công khai
   * Tương tự resend nhưng có thể có logic khác (retry với điều kiện khác)
   */
  @Public()
  @Post('retry-mail-otp')
  HandleRetryMailOtp(@Body() retryCodeDto: RetryCodeDto) {
    return this.authService.RetryCode(retryCodeDto);
  }

  /**
   * Endpoint gửi email quên mật khẩu
   *
   * @Public() - Cho phép truy cập công khai
   * Gửi email chứa link hoặc mã để reset mật khẩu đến email của user
   */
  @Public()
  @Post('send-forgot-password-mail')
  HandleSendForgotPasswordMail(
    @Body() sendForgotPasswordMailDto: SendForgotPasswordMailDto,
  ) {
    return this.authService.sendForgotPasswordMail(sendForgotPasswordMailDto);
  }

  /**
   * Endpoint xử lý reset mật khẩu
   *
   * @Public() - Cho phép truy cập công khai
   * Nhận mã reset password và mật khẩu mới từ user
   * Xác thực mã và cập nhật mật khẩu mới cho tài khoản
   */
  @Public()
  @Post('forgot-password')
  HandleForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.ForgotPassword(forgotPasswordDto);
  }
}
