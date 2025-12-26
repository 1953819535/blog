import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerificationService } from './verification.service.js';
import { SendVerificationCodeDto, VerifyCodeDto } from './dto/index.js';

@ApiTags('验证码')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) { }

  /**
   * 发送验证码测试接口
   * POST /verification/send-code
   */
  @Post('send-code')
  @ApiOperation({ summary: '发送验证码邮件（测试接口）' })
  async sendVerificationCode(@Body() dto: SendVerificationCodeDto) {
    return await this.verificationService.sendVerificationCode(dto.email);
  }

  /**
   * 验证邮箱验证码接口
   * POST /verification/verify-code
   */
  @Post('verify-code')
  @ApiOperation({ summary: '验证邮箱验证码' })
  async verifyCode(@Body() dto: VerifyCodeDto) {
    return await this.verificationService.verifyCode(dto.email, dto.code);
  }
}
