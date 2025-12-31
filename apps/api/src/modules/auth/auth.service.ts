import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { RedisService } from '../redis/redis.service.js';
import { EmailService } from '../email/email.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { Prisma } from '@my/prisma';

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
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * 生成JWT令牌
   * @param user 用户信息
   * @returns JWT令牌和有效载荷
   */
  async generateJwtToken(user: SafeUser): Promise<{ access_token: string; payload: JwtPayload }> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map(role => role.roleId),
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      payload: payload,
    };
  }

  /**
   * 生成6位随机验证码
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 通用的验证码发送方法
   * @param email 邮箱地址
   * @param type 验证码类型（register 或 login）
   * @param rateLimitSeconds 限流时长（秒）
   * @param codeExpireSeconds 验证码有效期（秒）
   */
  private async sendVerificationCode(
    email: string,
    type: 'register' | 'login',
    rateLimitSeconds = 60,
    codeExpireSeconds = 300,
  ) {
    // Redis key，用于限流和存储验证码
    const rateLimitKey = `email:verification:ratelimit:${type}:${email}`;
    const codeKey = `email:verification:${type}:${email}`;

    // 检查是否在限流时间内已发送过
    const exists = await this.redisService.exists(rateLimitKey);
    if (exists) {
      const ttl = await this.redisService.ttl(rateLimitKey);
      throw new HttpException(
        `验证码发送过于频繁，请${ttl}秒后再试`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 生成6位随机验证码
    const code = this.generateVerificationCode();

    // 发送验证码邮件
    try {
      await this.emailService.sendVerificationCode(email, code);

      // 设置限流
      await this.redisService.set(rateLimitKey, '1', rateLimitSeconds);

      // 将验证码存储到Redis，供后续验证使用
      await this.redisService.set(codeKey, String(code), codeExpireSeconds);

      return {
        message: '验证码发送成功，请查收邮件',
        expiresIn: codeExpireSeconds,
      };
    } catch (error) {
      throw new HttpException('邮件发送失败，请稍后重试', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 发送注册验证码
   * @param email 邮箱地址
   */
  async sendRegisterVerification(email: string) {
    // 检查邮箱是否已被注册
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new HttpException('该邮箱已被注册', HttpStatus.BAD_REQUEST);
    }

    return this.sendVerificationCode(email, 'register');
  }

  /**
   * 发送登录验证码
   * @param email 邮箱地址
   */
  async sendLoginVerification(email: string) {
    // 检查用户是否存在
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new HttpException('该邮箱未注册', HttpStatus.BAD_REQUEST);
    }

    // 检查用户是否已激活
    if (!user.isActive) {
      throw new HttpException('该账号已被禁用，请联系管理员', HttpStatus.FORBIDDEN);
    }

    return this.sendVerificationCode(email, 'login');
  }

  /**
   * 注册用户
   */
  async register(registerDto: RegisterDto) {
    // 验证验证码
    const codeKey = `email:verification:register:${registerDto.email}`;
    const storedCode = await this.redisService.getString(codeKey);

    if (!storedCode) {
      throw new HttpException('验证码已过期或不存在', HttpStatus.BAD_REQUEST);
    }

    if (storedCode !== registerDto.code) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    // 验证码正确后，删除该验证码（一次性使用）
    await this.redisService.del(codeKey);

    // 创建用户
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
    });
    return this.generateJwtToken(user);
  }

  /**
   * 用户密码登录
   * @param email 用户邮箱
   * @param password 用户密码
   */
  async loginWithPassword(email: string, password: string) {
    const user = await this.usersService.validateUserPassword(email, password);
    if (!user) {
      throw new HttpException('邮箱或密码错误', HttpStatus.UNAUTHORIZED);
    }
    return this.generateJwtToken(user);
  }

  /**
   * 验证码登录
   * @param email 用户邮箱
   * @param code 验证码
   */
  async loginWithCode(email: string, code: string) {
    // 先检查用户是否存在
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new HttpException('该邮箱未注册', HttpStatus.UNAUTHORIZED);
    }

    // 检查用户是否已激活
    if (!user.isActive) {
      throw new HttpException('该账号已被禁用，请联系管理员', HttpStatus.FORBIDDEN);
    }

    // 验证验证码
    const codeKey = `email:verification:login:${email}`;
    const storedCode = await this.redisService.getString(codeKey);

    if (!storedCode) {
      throw new HttpException('验证码已过期或不存在', HttpStatus.BAD_REQUEST);
    }

    if (storedCode !== code) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    // 验证码正确后，删除该验证码（一次性使用）
    await this.redisService.del(codeKey);

    return this.generateJwtToken(user);
  }
}