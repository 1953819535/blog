<template>
  <div class="index-page">
    <div class="page-header">
      <div class="brand">
        <svg class="brand-icon" viewBox="0 0 40 40" fill="none">
          <rect
            width="40"
            height="40"
            rx="6"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M12 13h16v1.5H12v-1.5zm0 6h12v1.5H12V19zm0 6h8v1.5h-8V25z"
            fill="white"
          />
        </svg>
        <span class="brand-name">Blog</span>
      </div>
      <ClientOnly>
        <div class="header-actions">
          <!-- 未登录状态 -->
          <div v-if="!isLoggedIn" class="auth-buttons">
            <NuxtLink to="/login" class="btn btn-primary">登录</NuxtLink>
            <NuxtLink to="/register" class="btn btn-outline">注册</NuxtLink>
          </div>
          <!-- 已登录状态 -->
          <div v-else class="user-menu">
            <div class="user-avatar">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                :alt="userInfo.nickname || userInfo.email"
              />
              <span v-else>{{
                (userInfo.nickname || userInfo.email)?.[0]?.toUpperCase() || 'U'
              }}</span>
            </div>
            <span class="user-email">{{ userInfo.email }}</span>
            <button @click="handleLogout" class="btn-logout">退出</button>
          </div>
        </div>
        <template #fallback>
          <!-- 骨架屏占位 - 避免布局跳动 -->
          <div class="header-actions">
            <div class="auth-buttons skeleton">
              <div class="skeleton-btn"></div>
              <div class="skeleton-btn"></div>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <div class="page-body">
      <div class="guest-card card">
        <div class="hero-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <div class="hero-section">
          <h1 class="title-1 title-center">记录想法<br />分享观点</h1>
          <p class="text text-base text-center mt-sm">简洁优雅的博客系统</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAvatarUrl } from '~/utils/image'

// 使用全局认证状态 - 由 plugin 在应用初始化时同步加载
const { isLoggedIn, userInfo, clearAuth } = useAuth()

// 计算完整的头像 URL
const avatarUrl = computed(() => getAvatarUrl(userInfo.value.avatar))

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
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: var(--space-lg) var(--space-xl);
  background: rgba(255, 252, 246, 0.8);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border-light);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.brand-icon {
  width: 28px;
  height: 28px;
  color: var(--color-primary);
}

.brand-name {
  font-size: var(--font-xl);
  font-weight: 500;
  color: var(--color-text);
  letter-spacing: -0.3px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-base);
  font-weight: 500;
  color: white;
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-email {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.btn-logout {
  padding: 6px var(--space-md);
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-logout:hover {
  color: var(--color-text);
  border-color: var(--color-primary);
  background: var(--color-bg-hover);
}

.page-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.guest-card {
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.hero-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(121, 85, 72, 0.1),
    rgba(93, 64, 55, 0.08)
  );
  border-radius: var(--radius-xl);
  color: var(--color-primary);
}

.hero-icon svg {
  width: 28px;
  height: 28px;
}

.hero-section {
  margin-bottom: var(--space-xl);
}

@media (max-width: 640px) {
  .page-header {
    padding: var(--space-md) var(--space-lg);
  }

  .page-body {
    padding: var(--space-md);
  }

  .guest-card {
    max-width: 100%;
  }

  .user-email {
    display: none;
  }

  .title-1 {
    font-size: var(--font-2xl);
  }

  .hero-icon {
    width: 48px;
    height: 48px;
  }

  .hero-icon svg {
    width: 24px;
    height: 24px;
  }
}

/* 骨架屏占位样式 */
.skeleton {
  pointer-events: none;
}

.skeleton-btn {
  height: 34px;
  width: 64px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 25%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(0, 0, 0, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
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
