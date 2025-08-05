import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteUserDto {
  @IsMongoId({ message: 'ID không hợp lệ' })
  @IsNotEmpty({ message: 'ID không được để trống' })
  id: string;
}
