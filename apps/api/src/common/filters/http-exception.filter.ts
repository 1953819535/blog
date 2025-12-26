import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/response.interface.js';
import { BusinessException } from '../exceptions/business.exception.js';
import { ResponseCode, ResponseMessage } from '../constants/code.enum.js';

/**
 * 全局异常过滤器
 * 捕获所有异常并统一处理
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 获取请求开始时间和请求 ID（由 RequestIdMiddleware 设置）
    const startTime = request.startTime || Date.now();
    const requestId = request.requestId || 'unknown';
    const duration = Date.now() - startTime;

    // 构建基础响应对象
    const baseResponse = {
      timestamp: Date.now(),
      path: request.url,
      requestId,
      duration,
    };

    // 处理业务异常
    if (exception instanceof BusinessException) {
      const exceptionResponse = exception.getResponse() as any;
      const businessResponse: ApiResponse = {
        ...baseResponse,
        code: exceptionResponse.code,
        message: exceptionResponse.message,
        data: exceptionResponse.data ?? null,
      };

      this.logger.warn(
        `[${requestId}] Business Exception: ${exceptionResponse.message} | Path: ${request.url} | Code: ${exceptionResponse.code} | Duration: ${duration}ms`,
      );

      return response.status(HttpStatus.OK).json(businessResponse);
    }

    // 处理 HTTP 异常
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || '请求处理失败';

      // 根据 HTTP 状态码映射业务状态码
      const code = this.mapHttpStatusToCode(status);

      const errorResponse: ApiResponse = {
        ...baseResponse,
        code,
        message: Array.isArray(message) ? message.join(', ') : message,
        data: null,
      };

      this.logger.warn(
        `[${requestId}] HTTP Exception: ${errorResponse.message} | Path: ${request.url} | Status: ${status} | Duration: ${duration}ms`,
      );

      return response.status(status).json(errorResponse);
    }

    // 处理未知异常（接口失败）
    this.logger.error(
      `[${requestId}] Unexpected Exception: ${exception} | Path: ${request.url} | Duration: ${duration}ms`,
      exception instanceof Error ? exception.stack : '',
    );

    const errorResponse: ApiResponse = {
      ...baseResponse,
      code: ResponseCode.INTERNAL_ERROR,
      message:
        process.env.NODE_ENV === 'production'
          ? ResponseMessage[ResponseCode.INTERNAL_ERROR]
          : exception instanceof Error
            ? exception.message
            : '服务器内部错误',
      data: process.env.NODE_ENV === 'development' && exception instanceof Error
        ? { stack: exception.stack, cause: exception.cause }
        : null,
    };

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }

  /**
   * 将 HTTP 状态码映射到业务状态码
   */
  private mapHttpStatusToCode(status: HttpStatus): ResponseCode {
    const statusCodeMap: Record<number, ResponseCode> = {
      [HttpStatus.BAD_REQUEST]: ResponseCode.BAD_REQUEST,
      [HttpStatus.UNAUTHORIZED]: ResponseCode.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ResponseCode.FORBIDDEN,
      [HttpStatus.NOT_FOUND]: ResponseCode.NOT_FOUND,
      [HttpStatus.METHOD_NOT_ALLOWED]: ResponseCode.METHOD_NOT_ALLOWED,
      [HttpStatus.CONFLICT]: ResponseCode.CONFLICT,
      [HttpStatus.INTERNAL_SERVER_ERROR]: ResponseCode.INTERNAL_ERROR,
      [HttpStatus.SERVICE_UNAVAILABLE]: ResponseCode.SERVICE_UNAVAILABLE,
    };

    return statusCodeMap[status] || ResponseCode.INTERNAL_ERROR;
  }
}
