import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';
import { EmailService } from '../email/email.service.js';

@Injectable()
export class VerificationService {
  constructor(
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) { }

  /**
   * 发送验证码
   * @param email 邮箱地址
   */
  async sendVerificationCode(email: string) {
    // Redis key，用于限流
    const rateLimitKey = `email:verification:ratelimit:${email}`;

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
      const codeKey = `email:verification:code:${email}`;
      await this.redisService.set(codeKey, String(code), 300);

      return {
        message: '验证码发送成功，请查收邮件',
      };
    } catch (error) {
      throw new HttpException('邮件发送失败，请稍后重试', HttpStatus.INTERNAL_SERVER_ERROR,);
    }
  }

  /**
   * 验证邮箱验证码
   * @param email 邮箱地址
   * @param code 验证码
   */
  async verifyCode(email: string, code: string) {
    const codeKey = `email:verification:code:${email}`;
    const storedCode = await this.redisService.get<string>(codeKey);

    if (!storedCode) {
      throw new HttpException('验证码已过期或不存在', HttpStatus.BAD_REQUEST,);
    }

    if (storedCode !== code) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST,);
    }

    // 验证成功后删除验证码
    await this.redisService.del(codeKey);

    return {
      message: '邮箱验证成功',
    };
  }

  /**
   * 生成6位随机验证码
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
