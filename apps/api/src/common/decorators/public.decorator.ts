import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 公开接口装饰器
 * 使用此装饰器的接口将跳过 JWT 认证
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
