import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service.js';
import type { SafeUser } from '../../users/types/index.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService) {
    super({
      usernameField: 'email', // 默认是 'username'，如有需要可在此修改
      passwordField: 'password',
    });
  }

  // Passport 自动调用此方法，验证通过返回 user，失败抛出异常
  async validate(email: string, password: string): Promise<SafeUser> {
    const user = await this.usersService.validateUserPassword(email, password);
    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }
    return user; // 返回值会挂载到 req.user
  }
}