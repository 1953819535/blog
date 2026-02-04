<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

import { marked } from 'marked'
import { getPostById, type PostWithRelations } from '~/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

// 配置 marked
marked.use({
  breaks: true,
  gfm: true,
})

// 获取路由参数
const route = useRoute()
const postId = route.params.id as string

// 获取文章详情
const { data: post, pending, error } = await useLazyAsyncData<PostWithRelations>(
  `post-${postId}`,
  async () => {
    const response = await getPostById(postId)
    return response.data
  }
)

// 渲染 Markdown 内容
const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return marked(post.value.content)
})

// 设置页面 meta 信息
useHead({
  title: () => post.value?.title || '文章详情',
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
</script>

<template>
  <div>
    <!-- 加载状态 -->
    <div v-if="pending" class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div class="space-y-6">
        <Skeleton class="h-8 w-24" />
        <Separator />
        <div class="space-y-4">
          <Skeleton class="h-12 w-3/4" />
          <Skeleton class="h-4 w-32" />
          <div class="space-y-2 mt-8">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Alert variant="destructive" class="mb-6">
        <AlertDescription>加载失败: {{ error.message }}</AlertDescription>
      </Alert>
      <Button variant="ghost" as-child>
        <NuxtLink to="/">← 返回首页</NuxtLink>
      </Button>
    </div>

    <!-- 文章内容 -->
    <article v-else-if="post" class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <!-- 文章主体 -->
      <div class="space-y-6">
        <h1 class="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          {{ post.title }}
        </h1>

        <!-- 元信息 -->
        <div class="flex items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary" class="font-mono">
            {{ formatDate(post.publishedAt || post.createdAt) }}
          </Badge>
        </div>

        <Separator />

        <!-- Markdown 内容 -->
        <div class="prose prose-neutral dark:prose-invert max-w-none" v-html="renderedContent"></div>
      </div>

      <!-- 底部 -->
      <footer class="mt-16 pt-8 border-t">
        <Button variant="ghost" as-child size="sm">
          <NuxtLink to="/">← 返回首页</NuxtLink>
        </Button>
      </footer>
    </article>

    <!-- 未找到 -->
    <div v-else class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
      <p class="text-muted-foreground mb-6">文章不存在</p>
      <Button variant="ghost" as-child>
        <NuxtLink to="/">← 返回首页</NuxtLink>
      </Button>
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/styles/tailwind.css";

/* Markdown 样式 - 使用 Tailwind Typography 的 prose 类 */
.prose :deep(h1) {
  @apply text-3xl font-bold mt-10 mb-5 pb-3 border-b;
}

.prose :deep(h2) {
  @apply text-2xl font-bold mt-8 mb-4 pb-2 border-b;
}

.prose :deep(h3) {
  @apply text-xl font-semibold mt-6 mb-3;
}

.prose :deep(h4) {
  @apply text-lg font-semibold mt-5 mb-2;
}

.prose :deep(p) {
  @apply mb-4 leading-7;
}

.prose :deep(a) {
  @apply text-primary hover:underline;
}

.prose :deep(code) {
  @apply bg-muted px-1.5 py-0.5 rounded text-sm font-mono;
}

.prose :deep(pre) {
  @apply bg-muted p-4 rounded-lg overflow-x-auto my-4;
}

.prose :deep(pre code) {
  @apply bg-transparent p-0;
}

.prose :deep(blockquote) {
  @apply border-l-4 border-border pl-4 my-4 text-muted-foreground italic;
}

.prose :deep(ul),
.prose :deep(ol) {
  @apply pl-6 my-4 space-y-2;
}

.prose :deep(li) {
  @apply leading-7;
}

.prose :deep(img) {
  @apply max-w-full h-auto rounded-lg my-4;
}

.prose :deep(table) {
  @apply w-full border-collapse my-4;
}

.prose :deep(th),
.prose :deep(td) {
  @apply border border-border px-3 py-2 text-left;
}

.prose :deep(th) {
  @apply bg-muted font-semibold;
}

.prose :deep(hr) {
  @apply border-t border-border my-8;
}

.prose :deep(strong) {
  @apply font-semibold;
}

.prose :deep(em) {
  @apply italic;
}
</style>
