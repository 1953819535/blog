/**
 * 认证中间件
 * 保护需要登录的路由
 */
export default defineNuxtRouteMiddleware((to) => {
  // 只在客户端检查 localStorage
  if (process.client) {
    const token = localStorage.getItem('token')
    
    if (!token) {
      return navigateTo('/login')
    }
  }
})