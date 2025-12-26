import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 当前用户装饰器
 * 用于从请求中获取已认证的用户信息
 *
 * @example
 * // 获取完整用户对象
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 *
 * @example
 * // 获取用户特定字段
 * @Get('profile')
 * getProfile(@CurrentUser('sub') userId: string) {
 *   return { userId };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
