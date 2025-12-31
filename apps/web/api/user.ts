/**
 * 用户相关 API
 */
import { apiGet } from '~/utils/api'
import type { UserInfo } from '~/types/api'

/**
 * 获取当前用户信息
 */
export function getUserProfile() {
  return apiGet<UserInfo>('/users/profile')
}
