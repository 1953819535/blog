import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendRegisterVerificationDto } from './dto/send-register-verification.dto.js';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: '发送注册验证码' })
  @Post('send-register-verification')
  async sendRegisterVerification(@Body() dto: SendRegisterVerificationDto) {
    return await this.authService.sendRegisterVerification(dto.email);
  }

  @ApiOperation({ summary: '注册' })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}