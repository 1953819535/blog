import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiResponse, PagedApiResponse, PagedData, PaginationInfo, } from '../interfaces/response.interface.js';
import { ResponseCode, ResponseMessage } from '../constants/code.enum.js';
import { RESPONSE_TYPE_KEY, ResponseType, } from '../decorators/response-type.decorator.js';

/**
 * 全局响应转换拦截器
 * 支持多种响应类型：标准、原始、分页、文件
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | PagedApiResponse<T> | T> {
  constructor(private readonly reflector: Reflector) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | PagedApiResponse<T> | T> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    // 获取请求开始时间和请求 ID（由 RequestIdMiddleware 设置）
    const startTime = request.startTime || Date.now();
    const requestId = request.requestId || 'unknown';

    // 获取响应类型装饰器
    const responseType =
      this.reflector.getAllAndOverride<ResponseType>(RESPONSE_TYPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || ResponseType.STANDARD;

    return next.handle().pipe(
      map((data) => {
        // 构建基础响应信息
        const baseResponse = {
          code: ResponseCode.SUCCESS,
          message: ResponseMessage[ResponseCode.SUCCESS],
          timestamp: Date.now(),
          path: request.url,
          requestId,
          duration: Date.now() - startTime,
        };

        // 根据响应类型处理数据
        switch (responseType) {
          case ResponseType.RAW:
            // 原始响应：直接返回数据，不包装
            return data;

          case ResponseType.FILE:
            // 文件响应：直接返回，通常配合 @Res() 使用
            return data;

          case ResponseType.PAGED:
            // 分页响应：特殊包装，自动从请求参数中提取 page 和 pageSize
            return this.buildPagedResponse(
              data as PagedData,
              baseResponse,
              request,
            );

          case ResponseType.STANDARD:
          default:
            // 标准响应：包装数据
            return {
              ...baseResponse,
              data,
            } as ApiResponse<T>;
        }
      }),
    );
  }

  /**
   * 构建分页响应
   * 自动从请求参数中提取 page 和 pageSize
   */
  private buildPagedResponse(
    pagedData: Partial<PagedData>,
    baseResponse: Partial<ApiResponse>,
    request: Request,
  ): PagedApiResponse {
    const { items = [], total = 0 } = pagedData;

    // 从请求查询参数中提取分页信息
    const page = parseInt((request.query.page as string) || '1', 10);
    const pageSize = parseInt((request.query.pageSize as string) || '10', 10);

    // 计算分页信息
    const totalPages = Math.ceil(total / pageSize);
    const pagination: PaginationInfo = {
      page,
      pageSize,
      total,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
    };

    return {
      ...baseResponse,
      data: items,
      pagination,
    } as PagedApiResponse;
  }
}
