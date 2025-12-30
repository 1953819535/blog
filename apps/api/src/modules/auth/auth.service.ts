import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { RedisService } from '../redis/redis.service.js';
import { EmailService } from '../email/email.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * 生成6位随机验证码
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 发送注册验证码
   * @param email 邮箱地址
   */
  async sendRegisterVerification(email: string) {
    // Redis key，用于限流
    const rateLimitKey = `email:verification:ratelimit:register:${email}`;

    // 检查是否在1分钟内已发送过
    const exists = await this.redisService.exists(rateLimitKey);
    if (exists) {
      // 获取剩余时间
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

      // 设置1分钟的限流
      await this.redisService.set(rateLimitKey, '1', 60);

      // 将验证码存储到Redis，有效期5分钟，供后续验证使用
      const codeKey = `email:verification:register:${email}`;
      await this.redisService.set(codeKey, String(code), 300);

      return {
        message: '验证码发送成功，请查收邮件',
      };
    } catch (error) {
      throw new HttpException('邮件发送失败，请稍后重试', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
    return await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
    });
  }
}