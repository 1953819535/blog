import { Prisma } from '@my/prisma';

/**
 * 包含关联数据的完整用户类型
 * 包含: profile, roles
 */
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    profile: true;
    roles: true;
  };
}>;

/**
 * 安全的用户返回类型
 * 排除敏感字段: password
 *
 * 用于:
 * - API 返回给前端
 * - 内部服务间传递
 * - Strategy validate() 返回值
 * - @CurrentUser() 装饰器类型
 */
export type SafeUser = Omit<UserWithRelations, 'password'>;
