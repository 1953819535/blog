/**
 * 认证状态管理 Composable
 * 提供全局的登录状态和用户信息管理
 */

export interface UserInfo {
  id: string
  email: string
  nickname?: string
  avatar?: string
}

export interface AuthState {
  isLoggedIn: boolean
  userInfo: UserInfo
}

export const useAuth = () => {
  const authState = useState<AuthState>('auth', () => ({
    isLoggedIn: false,
    userInfo: { id: '', email: '' }
  }))

  /**
   * 设置登录状态
   */
  const setAuth = (token: string, userInfo: UserInfo) => {
    if (process.client) {
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    }
    authState.value = {
      isLoggedIn: true,
      userInfo
    }
  }

  /**
   * 清除登录状态
   */
  const clearAuth = () => {
    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
    authState.value = {
      isLoggedIn: false,
      userInfo: { id: '', email: '' }
    }
  }

  /**
   * 获取 token
   */
  const getToken = () => {
    if (process.client) {
      return localStorage.getItem('token')
    }
    return null
  }

  return {
    // 状态
    isLoggedIn: computed(() => authState.value.isLoggedIn),
    userInfo: computed(() => authState.value.userInfo),

    // 方法
    setAuth,
    clearAuth,
    getToken
  }
}
