import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  LoginWithPwdDto,
  LoginWithCodeDto,
  SendRegisterVerificationDto,
  SendLoginVerificationDto
} from './dto/index.js';
import { CurrentUser, Public } from '../../common/index.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import type { SafeUser } from '../users/types/index.js';

@ApiTags('认证')
@Public()
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
  @UseGuards(LocalAuthGuard) // 使用 Passport Local 策略验证账号密码
  @Post('login-with-pwd')
  async loginWithPassword(
    @Body() _loginDto: LoginWithPwdDto, // 仅用于 Swagger 文档，实际验证由 LocalAuthGuard 处理
    @CurrentUser() user: SafeUser
  ) {
    // LocalStrategy 验证通过后，user 会被挂载到 request 上
    return this.authService.generateJwtToken(user);
  }

  @ApiOperation({ summary: '验证码登录' })
  @Post('login-with-code')
  loginWithCode(@Body() loginDto: LoginWithCodeDto) {
    return this.authService.loginWithCode(loginDto.email, loginDto.code);
  }
}