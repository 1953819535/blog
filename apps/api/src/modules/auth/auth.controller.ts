import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  LoginWithPwdDto,
  LoginWithCodeDto,
  SendRegisterVerificationDto,
  SendLoginVerificationDto
} from './dto/index.js';

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

  @ApiOperation({ summary: '发送登录验证码' })
  @Post('send-login-verification')
  async sendLoginVerification(@Body() dto: SendLoginVerificationDto) {
    return await this.authService.sendLoginVerification(dto.email);
  }

  @ApiOperation({ summary: '密码登录' })
  @Post('login-with-pwd')
  loginWithPassword(@Body() loginDto: LoginWithPwdDto) {
    return this.authService.loginWithPassword(loginDto.email, loginDto.password);
  }

  @ApiOperation({ summary: '验证码登录' })
  @Post('login-with-code')
  loginWithCode(@Body() loginDto: LoginWithCodeDto) {
    return this.authService.loginWithCode(loginDto.email, loginDto.code);
  }
}