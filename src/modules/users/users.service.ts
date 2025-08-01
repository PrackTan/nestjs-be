import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { hashPassword } from '@/utils/helpers';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}
  async findByEmail(email: string) {
    return await this.userModel.exists({ email });
  }
  async create(createUserDto: CreateUserDto) {
    const existUser = await this.findByEmail(createUserDto.email);
    if (existUser) {
      throw new BadRequestException(`${createUserDto.email} already exists`);
    }
    const hashedPassword = await hashPassword(createUserDto.password);
    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return newUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
