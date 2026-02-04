<template>
  <div class="py-8 sm:py-12">
      <div class="max-w-3xl mx-auto px-4 sm:px-6">
        <!-- Loading State -->
        <div v-if="pending" class="space-y-4">
          <Skeleton class="h-8 w-32" />
          <div class="space-y-3">
            <Card v-for="i in 3" :key="i">
              <CardHeader>
                <Skeleton class="h-6 w-3/4" />
                <Skeleton class="h-4 w-24 mt-2" />
              </CardHeader>
            </Card>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <p class="text-muted-foreground">加载失败: {{ error.message }}</p>
        </div>

        <!-- Posts List -->
        <div v-else-if="posts && posts.length > 0" class="space-y-6">
          <div class="flex items-center justify-between pb-3 border-b">
            <h2 class="text-sm text-muted-foreground">{{ posts.length }} 篇文章</h2>
          </div>

          <div class="space-y-4">
            <Card
              v-for="post in posts"
              :key="post.id"
              class="hover:shadow-md transition-shadow cursor-pointer"
            >
              <NuxtLink :to="`/posts/${post.id}`" class="block">
                <CardHeader>
                  <CardTitle class="text-xl hover:text-primary transition-colors">
                    {{ post.title }}
                  </CardTitle>
                  <CardDescription class="flex flex-col gap-2 mt-2">
                    <span class="text-xs font-mono">
                      {{ formatDate(post.publishedAt || post.createdAt) }}
                    </span>
                    <p v-if="post.excerpt" class="text-sm line-clamp-2">
                      {{ post.excerpt }}
                    </p>
                  </CardDescription>
                </CardHeader>
              </NuxtLink>
            </Card>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <p class="text-muted-foreground">暂无文章</p>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

import { getPosts, type PostWithRelations } from '~/api'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// 获取文章列表
const { data: posts, pending, error } = await useLazyAsyncData<PostWithRelations[]>('posts', async () => {
  const response = await getPosts()
  return response.data
})

// 格式化日期
function formatDate(date: Date | string | null) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}
</script>

