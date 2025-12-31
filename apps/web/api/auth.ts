/**
 * 认证相关 API
 */
import { apiPost } from '~/utils/api'
import type { LoginResponse, VerificationResponse } from '~/types/api'

/**
 * 发送注册验证码
 * @param email - 邮箱地址
 */
export function sendRegisterVerification(email: string) {
  return apiPost<VerificationResponse>('/auth/send-register-verification', { email })
}

/**
 * 发送登录验证码
 * @param email - 邮箱地址
 */
export function sendLoginVerification(email: string) {
  return apiPost<VerificationResponse>('/auth/send-login-verification', { email })
}

/**
 * 用户注册
 * @param data - 注册数据
 */
export interface RegisterData {
  email: string
  password: string
  code: string
  nickname?: string
}

export function register(data: RegisterData) {
  return apiPost<LoginResponse>('/auth/register', data)
}

/**
 * 密码登录
 * @param email - 邮箱
 * @param password - 密码
 */
export function loginWithPassword(email: string, password: string) {
  return apiPost<LoginResponse>('/auth/login-with-pwd', { email, password })
}

/**
 * 验证码登录
 * @param email - 邮箱
 * @param code - 验证码
 */
export function loginWithCode(email: string, code: string) {
  return apiPost<LoginResponse>('/auth/login-with-code', { email, code })
}
