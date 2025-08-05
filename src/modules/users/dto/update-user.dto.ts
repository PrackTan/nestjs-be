import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional, IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsMongoId({ message: 'ID không hợp lệ' })
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;
  @IsOptional()
  name: string;
  @IsOptional()
  email: string;
  @IsOptional()
  address: string;
  @IsOptional()
  phone: string;
}
