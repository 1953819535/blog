import { SetMetadata, applyDecorators } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './public.decorator.js';

// 定义本地访问的元数据键
export const IS_LOCAL_ONLY_KEY = 'isLocalOnly';

/**
 * 本地访问限制装饰器
 * 仅允许从 localhost 或 127.0.0.1 访问的接口使用
 * 可以应用于控制器类或具体方法上
 * 
 * @param options 配置选项
 * @param options.skipAuth 是否跳过认证检查，默认为true
 */
export const LocalOnly = (options?: { skipAuth?: boolean }) => {
  const skipAuth = options?.skipAuth !== false; // 默认为true

  if (skipAuth) {
    // 同时跳过认证检查
    return applyDecorators(
      SetMetadata(IS_LOCAL_ONLY_KEY, true),
      SetMetadata(IS_PUBLIC_KEY, true) // 标记为公开，跳过认证
    );
  }

  // 仅限制本地访问，不跳过认证
  return SetMetadata(IS_LOCAL_ONLY_KEY, true);
};