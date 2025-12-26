/**
 * 统一响应状态码枚举
 * 规则：
 * - 0: 业务成功
 * - 4xxxx: 业务失败（客户端错误）
 * - 5xxxx: 接口失败（服务端错误）
 */
export enum ResponseCode {
  // 成功
  SUCCESS = 0,

  // 业务失败 - 通用错误 (400xx)
  BAD_REQUEST = 40000, // 请求参数错误
  UNAUTHORIZED = 40001, // 未授权
  FORBIDDEN = 40003, // 禁止访问
  NOT_FOUND = 40004, // 资源不存在
  METHOD_NOT_ALLOWED = 40005, // 方法不允许
  CONFLICT = 40009, // 资源冲突

  // 业务失败 - 用户相关 (401xx)
  USER_NOT_FOUND = 40101, // 用户不存在
  USER_EXISTS = 40102, // 用户已存在
  USER_DISABLED = 40103, // 用户已禁用
  INVALID_CREDENTIALS = 40104, // 用户名或密码错误
  PASSWORD_WEAK = 40105, // 密码强度不够

  // 业务失败 - 认证相关 (402xx)
  TOKEN_INVALID = 40201, // Token 无效
  TOKEN_EXPIRED = 40202, // Token 已过期
  REFRESH_TOKEN_INVALID = 40203, // Refresh Token 无效

  // 业务失败 - 权限相关 (403xx)
  PERMISSION_DENIED = 40301, // 权限不足
  ROLE_NOT_FOUND = 40302, // 角色不存在
  PERMISSION_NOT_FOUND = 40303, // 权限不存在
  PERMISSION_CODE_EXISTS = 40304, // 权限编码已存在
  PERMISSION_IN_USE = 40305, // 权限正在使用中

  // 接口失败 - 服务器错误 (500xx)
  INTERNAL_ERROR = 50000, // 服务器内部错误
  SERVICE_UNAVAILABLE = 50001, // 服务不可用
  DATABASE_ERROR = 50002, // 数据库错误
  THIRD_PARTY_ERROR = 50003, // 第三方服务错误
}

/**
 * 状态码对应的默认消息
 */
export const ResponseMessage: Record<ResponseCode, string> = {
  [ResponseCode.SUCCESS]: '操作成功',

  // 通用错误
  [ResponseCode.BAD_REQUEST]: '请求参数错误',
  [ResponseCode.UNAUTHORIZED]: '未授权，请先登录',
  [ResponseCode.FORBIDDEN]: '禁止访问',
  [ResponseCode.NOT_FOUND]: '资源不存在',
  [ResponseCode.METHOD_NOT_ALLOWED]: '请求方法不允许',
  [ResponseCode.CONFLICT]: '资源冲突',

  // 用户相关
  [ResponseCode.USER_NOT_FOUND]: '用户不存在',
  [ResponseCode.USER_EXISTS]: '用户已存在',
  [ResponseCode.USER_DISABLED]: '用户已被禁用',
  [ResponseCode.INVALID_CREDENTIALS]: '用户名或密码错误',
  [ResponseCode.PASSWORD_WEAK]: '密码强度不够',

  // 认证相关
  [ResponseCode.TOKEN_INVALID]: 'Token 无效',
  [ResponseCode.TOKEN_EXPIRED]: 'Token 已过期',
  [ResponseCode.REFRESH_TOKEN_INVALID]: 'Refresh Token 无效',

  // 权限相关
  [ResponseCode.PERMISSION_DENIED]: '权限不足',
  [ResponseCode.ROLE_NOT_FOUND]: '角色不存在',
  [ResponseCode.PERMISSION_NOT_FOUND]: '权限不存在',
  [ResponseCode.PERMISSION_CODE_EXISTS]: '权限编码已存在',
  [ResponseCode.PERMISSION_IN_USE]: '权限正在使用中',

  // 服务器错误
  [ResponseCode.INTERNAL_ERROR]: '服务器内部错误',
  [ResponseCode.SERVICE_UNAVAILABLE]: '服务暂时不可用',
  [ResponseCode.DATABASE_ERROR]: '数据库错误',
  [ResponseCode.THIRD_PARTY_ERROR]: '第三方服务错误',
};
