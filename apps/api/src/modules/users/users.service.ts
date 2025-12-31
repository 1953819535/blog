import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CryptoService } from '../crypto/crypto.service.js';
import { User, Profile, Prisma } from '@my/prisma';

// 定义包含关联数据的用户类型
type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    profile: true;
    roles: true;
  };
}>;

// 定义安全的用户返回类型（排除密码）
type SafeUser = Omit<UserWithRelations, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) { }

  // 通过邮箱查找用户，用于登录验证
  async findByEmail(email: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        roles: true
      }
    });

    if (!user) {
      return null;
    }

    // 返回时不包含密码
    const { password, ...result } = user;
    return result;
  }

  // 创建用户，用于注册功能
  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    // 检查邮箱是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new HttpException('邮箱已被注册', HttpStatus.BAD_REQUEST);
    }

    // 加密密码
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: await this.cryptoService.hashPassword(createUserDto.password),
        nickname: createUserDto.nickname || `用户${Date.now()}`,
        // 同时创建默认的Profile
        profile: {
          create: {
            avatar: '',
            bio: '',
          }
        },
        // 分配默认角色
        roles: {
          create: {
            roleId: 'user',
          }
        }
      },
      include: {
        profile: true,
        roles: true
      }
    });

    // 返回时不包含密码
    const { password, ...result } = user;
    return result;
  }

  // 验证用户密码，用于登录验证
  async validateUserPassword(email: string, password: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        roles: true
      }
    });

    if (!user) {
      return null;
    }

    // 验证密码
    const isValidPassword = await this.cryptoService.comparePassword(password, user.password);

    if (!isValidPassword) {
      return null;
    }

    // 返回时不包含密码
    const { password: pwd, ...result } = user;
    return result;
  }

  // 根据ID查找用户
  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        roles: true
      }
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    // 返回时不包含密码
    const { password, ...result } = user;
    return result;
  }

  // 更新用户信息
  async update(id: string, updateData: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        profile: true,
        roles: true
      }
    });

    const { password, ...result } = user;
    return result;
  }

  // 更新用户密码
  async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await this.cryptoService.hashPassword(newPassword);

    return await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  // 删除用户
  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return { message: '用户删除成功' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }

  // 根据用户ID查找或创建Profile
  async findOrCreateProfile(userId: string): Promise<Profile> {
    let profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.profile.create({
        data: {
          userId,
          avatar: '',
          bio: '',
        }
      });
    }

    return profile;
  }

  // 更新用户Profile
  async updateProfile(userId: string, avatar?: string, bio?: string) {
    // 检查Profile是否存在，不存在则先创建
    await this.findOrCreateProfile(userId);

    return await this.prisma.profile.update({
      where: { userId },
      data: {
        avatar: avatar !== undefined ? avatar : undefined,
        bio: bio !== undefined ? bio : undefined,
      },
    });
  }

  // 获取所有用户（不包含密码）
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nickname: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        roles: true
      },
    });
    return users;
  }
}