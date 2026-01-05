import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { UsersService } from '../../users/users.service.js';
import type { SafeUser } from '../../users/types/index.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      // 从 Auth Header 中获取 Bearer Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // validate 的参数就是解析后的 Payload
  // 返回值会被赋值给 req.user，供 @CurrentUser() 装饰器使用
  async validate(payload: JwtPayload): Promise<SafeUser> {
    // 从数据库获取最新的用户信息，验证用户状态
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    if (user.isActive === false) {
      throw new UnauthorizedException('用户已被禁用');
    }
    return user;
  }
}