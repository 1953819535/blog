import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

const errorMsg = '请求未授权，请登录';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否标记为公开接口
    // getAllAndOverride 优先使用方法级别的元数据，如果没有则使用类级别的
    // 这样可以实现方法级别覆盖类级别的设置
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 方法级别（优先级更高）
      context.getClass(),   // 类级别
    ]);

    // 如果明确设置为 public（true），则跳过认证
    // 如果设置为 false 或 undefined，则需要认证
    if (isPublic === true) {
      this.logger.debug('接口标记为公开，跳过 JWT 认证');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(errorMsg);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      // 将 payload 分配给 request 对象
      // 以便可以在路由处理程序中访问它
      request['user'] = payload;
      this.logger.debug(`用户认证成功: userId=${payload.userId}`);
    } catch (error) {
      this.logger.warn(`JWT 验证失败: ${error.message}`);
      throw new UnauthorizedException(errorMsg);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}