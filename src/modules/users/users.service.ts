import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { hashPassword } from '@/utils/helpers';
import aqp from 'api-query-params';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { CodeAuthDto, ResendCodeDto } from '@/auth/dto/mail-dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}
  async findByEmail(email: string) {
    return await this.userModel.exists({ email });
  }
  async create(createUserDto: CreateUserDto) {
    const existUser = await this.findByEmail(createUserDto.email);
    if (existUser) {
      throw new BadRequestException(`${createUserDto.email}    exists`);
    }
    const hashedPassword = await hashPassword(createUserDto.password);
    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return newUser;
  }

  /**
   * Hàm findAll dùng để lấy danh sách người dùng từ cơ sở dữ liệu với các chức năng:
   * - Hỗ trợ lọc (filter), sắp xếp (sort), phân trang (pagination) dựa trên các tham số truyền vào.
   *
   * Tham số:
   * @param query: string - Chuỗi query string chứa các điều kiện lọc, sắp xếp (ví dụ: "name=John&sort=-createdAt")
   * @param current: number - Số trang hiện tại (nếu không truyền vào sẽ mặc định là 1)
   * @param pageSize: number - Số lượng bản ghi trên mỗi trang (nếu không truyền vào sẽ mặc định là 10)
   *
   * Quy trình thực hiện:
   * 1. Sử dụng thư viện 'api-query-params' (aqp) để phân tích query string thành 2 đối tượng: filter (điều kiện lọc) và sort (điều kiện sắp xếp).
   * 2. Loại bỏ 2 trường 'current' và 'pageSize' khỏi filter vì đây là tham số phân trang, không phải điều kiện lọc dữ liệu.
   * 3. Nếu current hoặc pageSize không được truyền vào thì gán giá trị mặc định lần lượt là 1 và 10.
   * 4. Đếm tổng số bản ghi phù hợp với điều kiện filter (totalItems).
   * 5. Tính tổng số trang (totalPage) dựa trên tổng số bản ghi và pageSize.
   * 6. Tính số bản ghi cần bỏ qua (skip) dựa trên trang hiện tại và pageSize.
   * 7. Truy vấn danh sách người dùng:
   *    - Lọc theo filter
   *    - Bỏ qua skip bản ghi đầu
   *    - Lấy tối đa pageSize bản ghi
   *    - Loại bỏ trường password khỏi kết quả trả về
   *    - Sắp xếp theo sort
   * 8. Trả về kết quả gồm:
   *    - data: danh sách người dùng
   *    - pagination: thông tin phân trang (tổng số bản ghi, tổng số trang, trang hiện tại, số bản ghi/trang)
   */
  async findAll(query: string, current: number, pageSize: number) {
    // Phân tích query string thành filter và sort
    const { filter, sort } = aqp(query);

    // Loại bỏ các trường phân trang khỏi filter
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    // Gán giá trị mặc định nếu không truyền vào
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Đếm tổng số bản ghi phù hợp với điều kiện lọc
    const totalItems = (await this.userModel.find(filter)).length;

    // Tính tổng số trang
    const totalPage = Math.ceil(totalItems / pageSize);

    // Tính số bản ghi cần bỏ qua
    const skip = (current - 1) * pageSize;

    // Truy vấn danh sách người dùng với các điều kiện lọc, phân trang, sắp xếp
    const users = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .select('-password') // Loại bỏ trường password
      .sort(sort as any);

    // Trả về dữ liệu và thông tin phân trang
    return {
      data: users,
      pagination: {
        totalItems,
        totalPage,
        current,
        pageSize,
      },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }
  async findbyEmail(email: string) {
    return await this.userModel.findOne({ email });
  }
  async update(updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(updateUserDto._id);
    if (!user) {
      throw new NotFoundException(
        `User with id ${updateUserDto._id} not found`,
      );
    }
    const updatedUser = await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        name: updateUserDto.name,
        email: updateUserDto.email,
        address: updateUserDto.address,
        phone: updateUserDto.phone,
      },
    );
    return user;
  }

  async remove(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userModel.deleteOne({ _id: id });
    return user;
  }
  async register(createAuthDto: CreateAuthDto) {
    const codeId = uuidv4();
    //check email exists
    const user = await this.findbyEmail(createAuthDto.email);
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    //hash password
    const hashedPassword = await hashPassword(createAuthDto.password);
    const newUser = await this.userModel.create({
      name: createAuthDto.name,
      email: createAuthDto.email,
      password: hashedPassword,
      codeId: codeId,
      isActive: false,
      codeExpired: dayjs().add(5, 'minutes').toDate(),
    });

    // return newUser
    await this.mailerService.sendMail({
      to: createAuthDto.email,
      subject: 'Activate your account at Webshop',
      text: 'Activate your account',
      template: 'register',
      context: {
        name: createAuthDto.name ?? createAuthDto.email,
        activationCode: codeId,
      },
    });
    return {
      message: 'Please check your email to activate your account',
      _id: newUser._id,
    };
  }
  // Phương thức xác minh mã kích hoạt tài khoản
  // Tham số: codeAuthDto chứa _id của user và codeId (mã kích hoạt) cần xác minh
  async handleCheckcode(codeAuthDto: CodeAuthDto) {
    // Tìm user trong database theo _id và codeId được cung cấp
    const user = await this.userModel.findOne({
      _id: codeAuthDto._id,
      codeId: codeAuthDto.codeId,
    });

    // Kiểm tra nếu không tìm thấy user với thông tin xác minh đã cung cấp
    if (!user) {
      throw new BadRequestException('Invalid verification info');
    }

    // Kiểm tra nếu mã kích hoạt đã hết hạn hoặc không tồn tại thời gian hết hạn
    if (!user.codeExpired || dayjs().isAfter(dayjs(user.codeExpired))) {
      throw new BadRequestException('Verification code expired');
    }

    // Kích hoạt tài khoản user
    user.isActive = true;
    // Xóa mã kích hoạt sau khi đã sử dụng
    user.codeId = undefined;
    // Xóa thời gian hết hạn của mã kích hoạt
    user.codeExpired = undefined as unknown as Date;
    // Lưu thay đổi vào database
    await user.save();

    // Trả về thông báo kích hoạt thành công
    return { message: 'Account activated' };
  }

  // Phương thức gửi lại mã kích hoạt tài khoản
  // Tham số: resendCodeDto chứa _id của user cần gửi lại mã
  async resendActivationCode(resendCodeDto: ResendCodeDto) {
    // Tìm user theo _id được cung cấp trong request
    const user = await this.userModel.findById(resendCodeDto._id);

    // Kiểm tra nếu không tìm thấy user
    if (!user) {
      throw new NotFoundException(
        `User with id ${resendCodeDto._id} not found`,
      );
    }

    // Kiểm tra nếu tài khoản đã được kích hoạt rồi
    if (user.isActive) {
      throw new BadRequestException('Account already activated');
    }

    // Tạo mã kích hoạt mới sử dụng uuidv4
    const newCodeId = uuidv4();

    // Cập nhật mã kích hoạt mới cho user
    user.codeId = newCodeId;

    // Đặt thời gian hết hạn cho mã kích hoạt (5 phút từ thời điểm hiện tại)
    user.codeExpired = dayjs().add(5, 'minutes').toDate();

    // Lưu thông tin user đã cập nhật vào database
    await user.save();

    // Gửi email chứa mã kích hoạt mới tới địa chỉ email của user
    await this.mailerService.sendMail({
      to: user.email, // Địa chỉ email người nhận
      subject: 'Activate your account at Webshop', // Tiêu đề email
      text: 'Activate your account', // Nội dung text thuần
      template: 'register', // Template email sử dụng
      context: {
        // Dữ liệu truyền vào template
        name: user.name ?? user.email, // Tên hiển thị (nếu không có tên thì dùng email)
        activationCode: newCodeId, // Mã kích hoạt mới
      },
    });

    // Trả về thông báo thành công
    return { message: 'Verification code resent' };
  }
}
