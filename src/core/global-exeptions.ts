import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidVerificationCodeException extends HttpException {
  constructor() {
    super('Invalid verification code', HttpStatus.BAD_REQUEST);
  }
}
