import { MailService } from '@/mail/mail.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { hashPassword } from '@/utils/helpers';
import aqp from 'api-query-params';
import { CreateAuthDto, ForgotPasswordDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import {
  CodeAuthDto,
  CodeAuthResetPasswordDto,
  ResendCodeDto,
  RetryCodeDto,
  SendForgotPasswordMailDto,
} from '@/auth/dto/mail-dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

/**
 * Service xử lý các thao tác liên quan đến User
 * Chịu trách nhiệm quản lý người dùng, xác thực email, quên mật khẩu
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Kiểm tra email đã tồn tại trong hệ thống
   * @param email - Địa chỉ email cần kiểm tra
   * @returns Promise<any> - Trả về thông tin user nếu tồn tại, null nếu không
   */
  async findByEmail(email: string) {
    return await this.userModel.exists({ email });
  }

  /**
   * Tạo user mới với kiểm tra email trùng lặp
   * @param createUserDto - Dữ liệu để tạo user mới
   * @returns Promise<User> - User vừa được tạo
   * @throws BadRequestException - Nếu email đã tồn tại
   */
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
    const { filter, sort, projection, population } = aqp(query);

    // Loại bỏ các trường phân trang khỏi filter
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    // Gán giá trị mặc định nếu không truyền vào
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Đếm tổng số bản ghi phù hợp với điều kiện lọc
    const total = await this.userModel.countDocuments(filter);

    // Tính tổng số trang
    const pages = Math.ceil(total / pageSize);

    // Tính số bản ghi cần bỏ qua
    const skip = (current - 1) * pageSize;

    // Truy vấn danh sách người dùng với các điều kiện lọc, phân trang, sắp xếp
    const users = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .select('-password') // Loại bỏ trường password
      .sort(sort as any)
      .populate(population as any)
      .select(projection as any);

    // Trả về dữ liệu và thông tin phân trang
    return {
      result: users,
      meta: {
        total,
        pages,
        current,
        pageSize,
      },
    };
  }

  /**
   * Tìm một user theo ID (chưa được implement đầy đủ)
   * @param id - ID của user cần tìm
   * @returns string - Thông báo placeholder
   */
  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  /**
   * Tìm user theo địa chỉ email
   * @param email - Địa chỉ email cần tìm
   * @returns Promise<User | null> - User nếu tồn tại, null nếu không
   */
  async findbyEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  /**
   * Cập nhật thông tin user
   * @param updateUserDto - Dữ liệu cập nhật user
   * @returns Promise<User> - User trước khi cập nhật
   * @throws NotFoundException - Nếu không tìm thấy user
   */
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

  /**
   * Xóa user theo ID
   * @param id - ID của user cần xóa
   * @returns Promise<User> - User đã bị xóa
   * @throws NotFoundException - Nếu không tìm thấy user
   */
  async remove(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return await this.userModel.softDelete({ _id: id });
  }

  /**
   * Đăng ký tài khoản mới với xác thực email
   * - Tạo mã kích hoạt ngẫu nhiên
   * - Hash mật khẩu
   * - Tạo user với trạng thái chưa kích hoạt
   * - Gửi email kích hoạt
   * @param createAuthDto - Dữ liệu đăng ký tài khoản
   * @returns Promise<{message: string, _id: string}> - Thông báo và ID user
   * @throws BadRequestException - Nếu email đã tồn tại
   */
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

    // Gửi email kích hoạt tài khoản
    await this.mailService.sendActivationMail({
      to: createAuthDto.email,
      name: createAuthDto.name ?? createAuthDto.email,
      activationCode: codeId,
    });
    return {
      message: 'Please check your email to activate your account',
      _id: newUser._id,
    };
  }

  /**
   * Xác minh mã kích hoạt tài khoản
   * - Tìm user theo ID và mã kích hoạt
   * - Kiểm tra thời gian hết hạn
   * - Kích hoạt tài khoản nếu mã còn hiệu lực
   * @param codeAuthDto - Dữ liệu xác minh chứa _id và codeId
   * @returns Promise<{message: string}> - Thông báo kết quả
   * @throws BadRequestException - Nếu thông tin xác minh không hợp lệ
   */
  async handleCheckcode(codeAuthDto: CodeAuthDto) {
    // Tìm user trong database theo _id và codeId được cung cấp
    const user = await this.userModel.findOne({
      _id: codeAuthDto._id,
      codeId: codeAuthDto.codeId || undefined,
    });

    // Kiểm tra nếu không tìm thấy user với thông tin xác minh đã cung cấp
    if (!user) {
      throw new BadRequestException('Invalid verification info');
    }

    // Kiểm tra nếu mã kích hoạt đã hết hạn hoặc không tồn tại thời gian hết hạn
    const isBefore = dayjs().isBefore(dayjs(user.codeExpired));
    if (isBefore) {
      await this.userModel.updateOne(
        { _id: codeAuthDto._id },
        {
          isActive: true,
          codeId: undefined,
          codeExpired: undefined,
        },
      );
    }

    // Trả về thông báo kích hoạt thành công
    return { message: 'Account activated' };
  }

  /**
   * Gửi lại mã kích hoạt tài khoản cho user theo ID
   * - Kiểm tra user tồn tại và chưa được kích hoạt
   * - Tạo mã kích hoạt mới
   * - Cập nhật thời gian hết hạn
   * - Gửi email kích hoạt mới
   * @param resendCodeDto - Dữ liệu chứa _id của user
   * @returns Promise<{message: string}> - Thông báo kết quả
   * @throws NotFoundException - Nếu không tìm thấy user
   * @throws BadRequestException - Nếu tài khoản đã được kích hoạt
   */
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
    if (!user.isActive) {
      const newCodeId = uuidv4();

      // Cập nhật mã kích hoạt mới cho user
      user.codeId = newCodeId;

      // Đặt thời gian hết hạn cho mã kích hoạt (5 phút từ thời điểm hiện tại)
      user.codeExpired = dayjs().add(5, 'minutes').toDate();

      // Lưu thông tin user đã cập nhật vào database
      await user.save();
      // Gửi email chứa mã kích hoạt mới tới địa chỉ email của user
      await this.mailService.sendActivationMail({
        to: user.email,
        name: user.name ?? user.email,
        activationCode: newCodeId,
      });
    } else {
      throw new BadRequestException('Account already activated');
    }
    return { message: 'Verification code resent' };
  }

  /**
   * Thử lại gửi mã kích hoạt cho user theo email
   * - Tìm user theo email
   * - Kiểm tra tài khoản chưa được kích hoạt
   * - Tạo mã kích hoạt mới và gửi email
   * @param retryCodeDto - Dữ liệu chứa email của user
   * @returns Promise<{message: string, _id: string}> - Thông báo và ID user
   * @throws NotFoundException - Nếu không tìm thấy user
   * @throws BadRequestException - Nếu tài khoản đã kích hoạt hoặc gửi email thất bại
   */
  async retryActivationCode(retryCodeDto: RetryCodeDto) {
    const user = await this.userModel.findOne({ email: retryCodeDto.email });
    if (!user) {
      throw new NotFoundException(
        `User with email ${retryCodeDto.email} not found`,
      );
    }
    if (user.isActive) {
      throw new BadRequestException('Account already activated');
    }
    try {
      const newCodeId = uuidv4();
      await user.updateOne({
        codeId: newCodeId,
        codeExpired: dayjs().add(5, 'minutes').toDate(),
      });
      await this.mailService.sendActivationMail({
        to: user.email,
        name: user.name ?? user.email,
        activationCode: newCodeId,
      });
      return {
        message: 'Verification code resent successfully',
        _id: user._id,
      };
    } catch (error) {
      throw new BadRequestException('Failed to send verification code');
    }
  }

  /**
   * Gửi email reset mật khẩu
   * - Tìm user theo email
   * - Tạo token reset mật khẩu
   * - Gửi email chứa link reset mật khẩu
   * @param email - Địa chỉ email cần reset mật khẩu
   * @returns Promise<{message: string, _id: string}> - Thông báo và ID user
   * @throws NotFoundException - Nếu không tìm thấy user
   */
  async sendForgotPasswordMail(
    sendForgotPasswordMailDto: SendForgotPasswordMailDto,
  ) {
    const user = await this.userModel.findOne({
      email: sendForgotPasswordMailDto.email,
    });
    if (!user) {
      throw new NotFoundException(
        `User with email ${sendForgotPasswordMailDto.email} not found`,
      );
    }
    try {
      const newCodeId = uuidv4();
      await user.updateOne({
        codeId: newCodeId,
        codeExpired: dayjs().add(5, 'minutes').toDate(),
      });
      await this.mailService.sendForgotPasswordMail({
        to: user.email,
        name: user.name ?? user.email,
        activationCode: newCodeId,
      });
      return {
        message: 'Please check your email to reset your password',
        _id: user._id,
      };
    } catch (error) {
      throw new BadRequestException('Failed to send verification code');
    }
  }
  /**
   * Cập nhật mật khẩu mới khi quên mật khẩu
   * - Tìm user theo email
   * - Hash mật khẩu mới và cập nhật
   * @param forgotPasswordDto - Dữ liệu chứa email và mật khẩu mới
   * @returns Promise<{message: string, _id: string}> - Thông báo và ID user
   * @throws NotFoundException - Nếu không tìm thấy user
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({
      email: forgotPasswordDto.email,
    });
    if (!user) {
      throw new NotFoundException(
        `User with email ${forgotPasswordDto.email} not found`,
      );
    }
    const newPassword = user.updateOne({
      password: await hashPassword(forgotPasswordDto.password),
    });
    return {
      message: 'Password updated successfully',
      _id: user._id,
    };
  }
  async updateRefreshToken(userId: string, refreshToken: string) {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { refreshToken: refreshToken },
    );
    return result;
  }
  findUserByRefreshToken(refreshToken: string) {
    return this.userModel.findOne({ refreshToken: refreshToken });
  }
}
