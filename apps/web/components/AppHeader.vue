<template>
  <header class="border-b">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="text-lg font-medium hover:text-primary transition-colors">
        网络日志
      </NuxtLink>

      <ClientOnly>
        <div class="flex items-center gap-2">
          <ModeToggle />
          
          <template v-if="!isLoggedIn">
            <Separator orientation="vertical" class="h-4 mx-1" />
            <Button variant="ghost" size="sm" as-child>
              <NuxtLink to="/login">登录</NuxtLink>
            </Button>
            <Button variant="ghost" size="sm" as-child>
              <NuxtLink to="/register">注册</NuxtLink>
            </Button>
          </template>
          
          <template v-else>
            <Separator orientation="vertical" class="h-4 mx-1" />
            <!-- 只有 admin 用户才显示管理入口 -->
            <Button v-if="isAdmin" variant="ghost" size="sm" as-child>
              <NuxtLink to="/admin">
                <Icon icon="lucide:layout-dashboard" class="mr-1.5 h-4 w-4" />
                管理
              </NuxtLink>
            </Button>
            <Button variant="ghost" size="sm" as-child>
              <NuxtLink to="/profile">{{ userInfo?.nickname || '资料' }}</NuxtLink>
            </Button>
            <Button variant="ghost" size="sm" @click="handleLogout">
              退出
            </Button>
          </template>
        </div>
        
        <template #fallback>
          <div class="flex items-center gap-2">
            <Skeleton class="h-8 w-24" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@iconify/vue'
import ModeToggle from '@/components/ModeToggle.vue'

const { isLoggedIn, userInfo, clearAuth } = useAuth()

// 检查是否为管理员
const isAdmin = computed(() => {
  const roles = userInfo.value?.roles || []
  return roles.some((r: { roleId: string }) => r.roleId === 'admin')
})

const handleLogout = () => {
  if (!confirm('确定要退出登录吗?')) return
  clearAuth()
}
</script>