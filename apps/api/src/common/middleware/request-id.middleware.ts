import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一的追踪 ID
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 从请求头中获取 requestId，如果没有则生成新的
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    // 将 requestId 附加到请求对象上
    req.requestId = requestId;

    // 在响应头中返回 requestId，便于客户端追踪
    res.setHeader('X-Request-Id', requestId);

    // 记录请求开始时间，用于计算响应时间
    req.startTime = Date.now();

    next();
  }
}
