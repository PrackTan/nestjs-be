/* eslint-disable prettier/prettier */
export interface SendActivationMailDto {
  to: string;
  name: string;
  activationCode: string;
}

export interface SendForgotPasswordMailDto {
  to: string;
  name: string;
  activationCode: string;
}

export interface SendWelcomeMailDto {
  to: string;
  name: string;
}

export interface SendNotificationMailDto {
  to: string;
  name: string;
  subject: string;
  message: string;
}
