/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  SendActivationMailDto,
  SendForgotPasswordMailDto,
  SendWelcomeMailDto,
  SendNotificationMailDto,
} from './dto/send-mail.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Gửi email kích hoạt tài khoản
   * @param sendActivationMailDto - Dữ liệu để gửi email kích hoạt
   */
  async sendActivationMail(
    sendActivationMailDto: SendActivationMailDto,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: sendActivationMailDto.to,
        subject: 'Activate your account at Webshop',
        text: 'Activate your account',
        template: 'register',
        context: {
          name: sendActivationMailDto.name,
          activationCode: sendActivationMailDto.activationCode,
        },
      });
    } catch (error) {
      throw new Error(`Failed to send activation email: ${error.message}`);
    }
  }

  /**
   * Gửi email quên mật khẩu
   * @param sendForgotPasswordMailDto - Dữ liệu để gửi email reset mật khẩu
   */
  async sendForgotPasswordMail(
    sendForgotPasswordMailDto: SendForgotPasswordMailDto,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: sendForgotPasswordMailDto.to,
        subject: 'Reset your password at Webshop',
        text: 'Reset your password',
        template: 'forgot-password', // Bạn cần tạo template này
        context: {
          name: sendForgotPasswordMailDto.name,
          resetToken: sendForgotPasswordMailDto.activationCode,
        },
      });
    } catch (error) {
      throw new Error(`Failed to send forgot password email: ${error.message}`);
    }
  }

  /**
   * Gửi email chào mừng
   * @param sendWelcomeMailDto - Dữ liệu để gửi email chào mừng
   */
  async sendWelcomeMail(sendWelcomeMailDto: SendWelcomeMailDto): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: sendWelcomeMailDto.to,
        subject: 'Welcome to Webshop!',
        text: 'Welcome to our platform',
        template: 'welcome', // Bạn cần tạo template này
        context: {
          name: sendWelcomeMailDto.name,
        },
      });
    } catch (error) {
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  /**
   * Gửi email thông báo tùy chỉnh
   * @param sendNotificationMailDto - Dữ liệu để gửi email thông báo
   */
  async sendNotificationMail(
    sendNotificationMailDto: SendNotificationMailDto,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: sendNotificationMailDto.to,
        subject: sendNotificationMailDto.subject,
        text: sendNotificationMailDto.message,
        template: 'notification', // Bạn cần tạo template này
        context: {
          name: sendNotificationMailDto.name,
          message: sendNotificationMailDto.message,
        },
      });
    } catch (error) {
      throw new Error(`Failed to send notification email: ${error.message}`);
    }
  }

  /**
   * Gửi email tùy chỉnh với template và context
   * @param to - Email người nhận
   * @param subject - Tiêu đề email
   * @param template - Template email
   * @param context - Dữ liệu truyền vào template
   */
  async sendCustomMail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
    } catch (error) {
      throw new Error(`Failed to send custom email: ${error.message}`);
    }
  }
}
