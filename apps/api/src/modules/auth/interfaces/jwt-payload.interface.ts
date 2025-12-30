export interface JwtPayload {
  /** 用户ID */
  userId: string;

  /** 用户邮箱 */
  email?: string;

  /** 用户名 */
  nickname?: string;

  /** 角色代码列表 */
  roles?: string[];

  /** 签发时间 */
  iat?: number;

  /** 过期时间 */
  exp?: number;
}