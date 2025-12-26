// src/email/email.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    // 初始化 Resend 客户端
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY not configured');
      throw new Error('RESEND_API_KEY not configured');
    }
    this.resend = new Resend(apiKey);
    console.log('✅ Email service initialized successfully');
  }

  /**
   * 发送验证码邮件
   * @param to 接收者邮箱
   * @param code 验证码
   */
  async sendVerificationCode(to: string, code: string) {
    const from = this.configService.get<string>('MAIL_FROM_ADDRESS');
    if (!from) {
      this.logger.error('MAIL_FROM_ADDRESS not configured');
      throw new InternalServerErrorException('MAIL_FROM_ADDRESS not configured');
    }

    this.logger.log(`Attempting to send verification code to ${to}`);
    const startTime = Date.now();

    try {
      const data = await this.resend.emails.send({
        from,
        to: [to],
        subject: '注册/登录验证码',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>欢迎使用!</h2>
            <p>您的验证码是：</p>
            <h1 style="color: #4A90E2; letter-spacing: 5px;">${code}</h1>
            <p>该验证码在 5 分钟内有效，请勿泄露给他人。</p>
          </div>
        `,
      });

      if (data.error) {
        this.logger.error(`Resend API Error for ${to}: ${JSON.stringify(data.error)}`);
        throw new InternalServerErrorException('邮件发送失败');
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Verification code email sent successfully to ${to} | EmailId: ${data.data?.id || 'unknown'} | Duration: ${duration}ms`,
      );

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to send verification code to ${to} | Duration: ${duration}ms | Error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('邮件服务暂时不可用');
    }
  }
}