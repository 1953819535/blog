import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_LOCAL_ONLY_KEY } from '../decorators/local-only.decorator.js';

/**
 * 本地访问限制守卫
 * 仅允许从 localhost 或 127.0.0.1 访问的接口使用
 */
@Injectable()
export class LocalOnlyGuard implements CanActivate {
  private readonly logger = new Logger(LocalOnlyGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 检查是否标记为仅本地访问
    // getAllAndOverride会从方法和类两个层级获取元数据，优先级为方法 > 类
    const isLocalOnly = this.reflector.getAllAndOverride<boolean>(IS_LOCAL_ONLY_KEY, [
      context.getHandler(), // 获取当前处理的方法
      context.getClass(),   // 获取当前处理的类
    ]);

    // 如果没有标记为仅本地访问，则直接允许访问
    if (!isLocalOnly) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);

    // 允许的本地 IP 地址
    const allowedIps = ['::1', '127.0.0.1', 'localhost'];

    if (allowedIps.includes(ip)) {
      this.logger.debug(`本地访问验证通过: IP=${ip}`);
      return true;
    }

    this.logger.warn(`拒绝非本地访问: IP=${ip}`);
    throw new ForbiddenException('此接口仅允许本地服务调用');
  }

  /**
   * 获取客户端真实IP地址
   * @param request HTTP请求对象
   * @returns 客户端IP地址
   */
  private getClientIp(request: Request): string {
    // 尝试从各种可能的头部获取真实IP
    const forwarded = request.headers['x-forwarded-for'];
    const realIp = request.headers['x-real-ip'];

    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }

    if (typeof realIp === 'string') {
      return realIp.trim();
    }

    // 回退到连接远程地址 (使用 socket 替代已弃用的 connection)
    return request.socket.remoteAddress || request.ip || 'unknown';
  }
}