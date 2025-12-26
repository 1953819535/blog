import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseCode, ResponseMessage } from '../constants/code.enum.js';

/**
 * 业务异常类
 * 用于业务逻辑失败的场景（如：用户名已存在、余额不足等）
 * HTTP 状态码为 200，通过 code 字段区分业务状态
 */
export class BusinessException extends HttpException {
  constructor(code: ResponseCode, message?: string, data?: any) {
    // HTTP 状态码统一返回 200
    super(
      {
        code,
        message: message || ResponseMessage[code] || '业务处理失败',
        data: data ?? null,
      },
      HttpStatus.OK,
    );
  }
}
