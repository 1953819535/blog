<template>
  <div class="index-page">
    <div class="page-header">
      <div class="brand">
        <svg class="brand-icon" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="6" fill="currentColor" opacity="0.9" />
          <path d="M12 13h16v1.5H12v-1.5zm0 6h12v1.5H12V19zm0 6h8v1.5h-8V25z" fill="white" />
        </svg>
        <NuxtLink to="/" class="brand-name">Blog</NuxtLink>
      </div>
      <ClientOnly>
        <div class="header-actions">
          <div v-if="!isLoggedIn" class="auth-buttons">
            <NuxtLink to="/login" class="btn-link">登录</NuxtLink>
            <span class="divider">|</span>
            <NuxtLink to="/register" class="btn-link">注册</NuxtLink>
          </div>
          <div v-else class="user-menu">
            <span class="user-email">{{ userInfo?.email }}</span>
            <span class="divider">|</span>
            <button @click="handleLogout" class="btn-link">退出</button>
          </div>
        </div>
        <template #fallback>
          <div class="header-actions">
            <div class="auth-buttons skeleton">
              <div class="skeleton-btn"></div>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <div class="page-body">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="pending" class="loading">
          <p>加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error">
          <p>加载失败: {{ error.message }}</p>
        </div>

        <!-- 文章列表 -->
        <main v-else-if="posts && posts.length > 0" class="main">
          <h2 class="section-title">{{ posts.length }} 篇文章</h2>

          <div class="posts-list">
            <NuxtLink
              v-for="post in posts"
              :key="post.id"
              :to="`/posts/${post.id}`"
              class="post-item"
            >
              <span class="post-date">{{ formatDate(post.publishedAt || post.createdAt) }}</span>
              <span class="post-title">{{ post.title }}</span>
            </NuxtLink>
          </div>
        </main>

        <!-- 空状态 -->
        <div v-else class="empty">
          <p>暂无文章</p>
        </div>
      </div>
    </div>

    <footer class="page-footer">
      <p>&copy; {{ new Date().getFullYear() }} Blog. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { getPosts, type PostWithRelations } from '~/api'

// 使用全局认证状态
const { isLoggedIn, userInfo, clearAuth } = useAuth()

// 获取文章列表
const { data: posts, pending, error } = await useLazyAsyncData<PostWithRelations[]>('posts', async () => {
  const response = await getPosts()
  return response.data
})

// 格式化日期
function formatDate(date: Date | string | null) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
}

const handleLogout = () => {
  if (!confirm('确定要退出登录吗?')) {
    return
  }
  clearAuth()
}
</script>

<style scoped>
.index-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-icon {
  width: 24px;
  height: 24px;
  color: var(--color-primary, #795548);
}

.brand-name {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  text-decoration: none;
}

.header-actions {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.auth-buttons,
.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-link {
  color: #333;
  text-decoration: none;
  padding: 4px 8px;
  transition: color 0.2s;
}

.btn-link:hover {
  color: var(--color-primary, #795548);
}

.divider {
  color: #ddd;
}

.user-email {
  color: #666;
  font-size: 14px;
}

.page-body {
  flex: 1;
  padding: 40px 0;
}

.container {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.main {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 14px;
  color: #999;
  font-weight: normal;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  display: flex;
  align-items: baseline;
  gap: 12px;
  text-decoration: none;
  padding: 4px 0;
}

.post-date {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  font-family: monospace;
}

.post-title {
  font-size: 18px;
  color: #333;
  line-height: 1.5;
}

.post-item:hover .post-title {
  color: var(--color-primary, #795548);
  text-decoration: underline;
}

.page-footer {
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid #eee;
  color: #999;
  font-size: 14px;
}

@media (max-width: 640px) {
  .container {
    padding: 0 16px;
  }

  .page-header {
    padding: 16px 0;
  }

  .page-body {
    padding: 24px 0;
  }

  .post-title {
    font-size: 16px;
  }
}

/* 骨架屏 */
.skeleton {
  pointer-events: none;
}

.skeleton-btn {
  height: 28px;
  width: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
