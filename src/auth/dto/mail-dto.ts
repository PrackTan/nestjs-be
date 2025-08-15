import { ISendMailOptions } from '@nestjs-modules/mailer';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMailDto implements ISendMailOptions {}

// Dùng để xác minh tài khoản: cần userId và codeId (mã kích hoạt)
export class CodeAuthDto {
  @IsNotEmpty()
  _id: string; // userId

  @IsNotEmpty()
  codeId: string; // activation code
}
export class CodeAuthResetPasswordDto {
  @IsNotEmpty()
  _id: string; // userId

  @IsNotEmpty()
  resetToken: string; // reset password code
}
// Dùng để gửi lại mã kích hoạt
export class ResendCodeDto {
  @IsNotEmpty()
  _id: string; // userId
}

export class RetryCodeDto {
  @IsNotEmpty()
  email: string; // userId
}

export class SendForgotPasswordMailDto {
  @IsNotEmpty()
  email: string; // userId
}
