import { type UserRole } from "@my/prisma"

/**
 * 通用 API 响应结构
 */
export interface ApiResponse<T = any> {
  /** 时间戳 */
  timestamp: number
  /** 请求路径 */
  path: string
  /** 请求 ID */
  requestId: string
  /** 请求耗时（毫秒） */
  duration: number
  /** 业务状态码 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

/**
 * 分页响应数据
 */
export interface PaginationData<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: string
  email: string
  nickname: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  profile?: {
    avatar: string
    bio: string
  },
  roles?: UserRole[]
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  access_token: string
  user: UserInfo
}

/**
 * 验证码发送响应
 */
export interface VerificationResponse {
  message: string
  expiresIn: number
}
