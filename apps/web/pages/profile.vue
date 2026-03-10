<template>
  <div class="max-w-2xl mx-auto px-4 space-y-8">
    <!-- 页面标题 -->
    <h1 class="text-lg font-bold">个人资料</h1>

    <!-- 基本信息 -->
    <section class="space-y-4">
      <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pb-2 border-b">
        基本信息
      </h2>
      
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="p-3 rounded-lg border bg-card">
          <span class="text-[10px] text-muted-foreground">邮箱</span>
          <p class="text-sm mt-1">{{ userInfo?.email }}</p>
        </div>
        <div class="p-3 rounded-lg border bg-card">
          <span class="text-[10px] text-muted-foreground">昵称</span>
          <p class="text-sm mt-1">{{ userInfo?.nickname || '未设置' }}</p>
        </div>
        <div class="p-3 rounded-lg border bg-card">
          <span class="text-[10px] text-muted-foreground">注册时间</span>
          <p class="text-sm mt-1">{{ formatDate(userInfo?.createdAt) }}</p>
        </div>
      </div>
    </section>

    <!-- 个人简介 -->
    <section class="space-y-4">
      <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pb-2 border-b">
        个人简介
      </h2>
      <p class="text-sm text-muted-foreground px-1">
        {{ userInfo?.profile?.bio || '暂无简介' }}
      </p>
    </section>

    <!-- 快捷入口 -->
    <section class="space-y-4">
      <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pb-2 border-b">
        快捷入口
      </h2>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" as-child>
          <NuxtLink to="/admin">
            <Icon icon="lucide:layout-dashboard" class="mr-1.5 h-3.5 w-3.5" />
            管理后台
          </NuxtLink>
        </Button>
        <Button variant="outline" size="sm" as-child>
          <NuxtLink to="/admin/posts">
            <Icon icon="lucide:file-text" class="mr-1.5 h-3.5 w-3.5" />
            我的文章
          </NuxtLink>
        </Button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { userInfo } = useAuth()

const formatDate = (date: string | undefined) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>