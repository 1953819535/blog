import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 公开接口装饰器
 * 使用此装饰器的接口将跳过 JWT 认证
 *
 * @param isPublic - 是否公开，默认 true
 *
 * @example
 * // 场景 1: 整个 Controller 设置为公开（登录/注册等）
 * @Public()
 * @Controller('auth')
 * class AuthController {}
 *
 * @example
 * // 场景 2: Controller 公开，但某个方法需要认证
 * @Public()
 * @Controller('auth')
 * class AuthController {
 *   @Public(false) // 覆盖类级别的设置，需要认证
 *   @Get('admin/settings')
 *   getAdminSettings() {}
 * }
 *
 * @example
 * // 场景 3: Controller 默认需要认证，某个方法公开
 * @Controller('users')
 * class UsersController {
 *   @Public() // 该方法公开
 *   @Get('public-info')
 *   getPublicInfo() {}
 *
 *   @Get('profile') // 需要认证
 *   getProfile() {}
 * }
 */
export const Public = (isPublic: boolean = true) => SetMetadata(IS_PUBLIC_KEY, isPublic);
