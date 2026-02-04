<template>
  <header class="border-b">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="text-lg font-medium text-foreground hover:text-primary transition-colors">
          王登峰的网络日志
        </NuxtLink>
      </div>

      <ClientOnly>
        <div class="flex items-center gap-3">
          <!-- 主题切换按钮 -->
          <ModeToggle />

          <Separator orientation="vertical" class="h-4" />

          <!-- 认证按钮 -->
          <div v-if="!isLoggedIn" class="flex items-center gap-3">
            <Button variant="ghost" as-child size="sm">
              <NuxtLink to="/login">登录</NuxtLink>
            </Button>
            <Separator orientation="vertical" class="h-4" />
            <Button variant="ghost" as-child size="sm">
              <NuxtLink to="/register">注册</NuxtLink>
            </Button>
          </div>
          <div v-else class="flex items-center gap-3">
            <span class="text-sm text-muted-foreground">{{ userInfo?.email }}</span>
            <Separator orientation="vertical" class="h-4" />
            <Button variant="ghost" size="sm" @click="handleLogout">
              退出
            </Button>
          </div>
        </div>
        <template #fallback>
          <div class="flex items-center gap-2">
            <Skeleton class="h-8 w-16" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import ModeToggle from '@/components/ModeToggle.vue'

// 使用全局认证状态
const { isLoggedIn, userInfo, clearAuth } = useAuth()

const handleLogout = () => {
  if (!confirm('确定要退出登录吗?')) {
    return
  }
  clearAuth()
}
</script>
