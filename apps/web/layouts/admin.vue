<template>
  <div class="min-h-screen bg-background flex flex-col">
    <header class="border-b">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <!-- Logo + 导航 -->
        <div class="flex items-center gap-6">
          <NuxtLink to="/admin" class="text-lg font-medium hover:text-primary transition-colors">
            管理后台
          </NuxtLink>
          <nav class="flex items-center gap-4">
            <NuxtLink 
              to="/admin/posts" 
              class="text-sm transition-colors"
              :class="$route.path.startsWith('/admin/posts') 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'"
            >
              文章
            </NuxtLink>
            <NuxtLink 
              to="/admin/categories" 
              class="text-sm transition-colors"
              :class="$route.path === '/admin/categories' 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'"
            >
              分类
            </NuxtLink>
            <NuxtLink 
              to="/admin/tags" 
              class="text-sm transition-colors"
              :class="$route.path === '/admin/tags' 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'"
            >
              标签
            </NuxtLink>
          </nav>
        </div>

        <!-- 右侧操作 -->
        <div class="flex items-center gap-2">
          <ModeToggle />
          <Separator orientation="vertical" class="h-4 mx-1" />
          <Button variant="ghost" size="sm" as-child>
            <NuxtLink to="/">返回前台</NuxtLink>
          </Button>
          <Separator orientation="vertical" class="h-4 mx-1" />
          <span class="text-sm text-muted-foreground hidden sm:inline">{{ userInfo?.nickname || userInfo?.email }}</span>
          <Button variant="ghost" size="sm" @click="handleLogout">
            退出
          </Button>
        </div>
      </div>
    </header>

    <main class="flex-1 py-6 sm:py-12">
      <div class="max-w-2xl mx-auto px-4 sm:px-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import ModeToggle from '@/components/ModeToggle.vue'

const { userInfo, clearAuth } = useAuth()

const handleLogout = () => {
  if (!confirm('确定要退出登录吗?')) return
  clearAuth()
  navigateTo('/login')
}
</script>