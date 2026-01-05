/**
 * 客户端认证插件
 * 在应用初始化时同步读取 localStorage 中的登录状态
 * 避免页面闪烁和异步加载延迟
 */
export default defineNuxtPlugin(() => {
  const authState = useState('auth', () => ({
    isLoggedIn: false,
    userInfo: null
  }))

  // 同步读取 localStorage (仅在客户端)
  if (process.client) {
    try {
      const token = localStorage.getItem('token')
      const storedUserInfo = localStorage.getItem('userInfo')

      if (token && storedUserInfo) {
        authState.value = {
          isLoggedIn: true,
          userInfo: JSON.parse(storedUserInfo)
        }
      }
    } catch (error) {
      console.error('Failed to load auth state:', error)
      // 数据损坏时清理
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
