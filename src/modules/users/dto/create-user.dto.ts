import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  name: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  address: string;

  image: string;
}
