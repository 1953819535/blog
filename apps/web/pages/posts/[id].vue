<script setup lang="ts">
definePageMeta({
  layout: 'default',
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
const {
  data: post,
  pending,
  error,
} = await useLazyAsyncData<PostWithRelations>(`post-${postId}`, async () => {
  const response = await getPostById(postId)
  return response.data
})

// 渲染 Markdown 内容
const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return marked(post.value.content)
})

// 设置页面 meta 信息
useHead({
  title: () => post.value?.title || '文章详情',
  meta: [{ name: 'description', content: () => post.value?.excerpt || '' }],
})

// 格式化日期
function formatDate(date: Date | string | null) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d
    .toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- 加载状态 -->
    <div v-if="pending" class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div class="space-y-8">
        <!-- 标题骨架 -->
        <div class="space-y-4">
          <Skeleton class="h-10 w-full sm:w-3/4" />
          <div class="flex gap-4">
            <Skeleton class="h-4 w-20" />
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-4 w-16" />
          </div>
        </div>
        <Separator />
        <!-- 内容骨架 -->
        <div class="space-y-4">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-2/3" />
        </div>
        <!-- 标签骨架 -->
        <div class="flex gap-2">
          <Skeleton class="h-6 w-16" />
          <Skeleton class="h-6 w-16" />
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
      <Alert variant="destructive" class="mb-6 text-left">
        <AlertDescription>加载失败: {{ error.message }}</AlertDescription>
      </Alert>
      <Button variant="outline" as-child>
        <NuxtLink to="/">← 返回首页</NuxtLink>
      </Button>
    </div>

    <!-- 文章内容 -->
    <article v-else-if="post" class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <!-- 文章头部 -->
      <header class="space-y-6 mb-8">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          {{ post.title }}
        </h1>

        <!-- 元信息栏 -->
        <div class="flex flex-wrap items-center gap-y-3 gap-x-4 text-sm text-muted-foreground">
          <!-- 作者 -->
          <div class="flex items-center gap-2">
            <span class="font-medium text-foreground">@{{ post.author?.nickname }}</span>
          </div>

          <Separator orientation="vertical" class="h-4 hidden sm:block" />

          <!-- 发布日期 -->
          <time :datetime="post.publishedAt || post.createdAt" class="flex items-center">
            {{ formatDate(post.publishedAt || post.createdAt) }}
          </time>

          <Separator orientation="vertical" class="h-4 hidden sm:block" />

          <!-- 分类 -->
          <div v-if="post.category" class="flex items-center gap-1.5">
            <span class="text-muted-foreground/70">分类:</span>
            <NuxtLink :to="`/category/${post.category.slug}`" class="font-medium text-primary hover:underline transition-colors">
              {{ post.category.name }}
            </NuxtLink>
          </div>
        </div>

        <Separator />
      </header>

      <!-- Markdown 主体内容 -->
      <div class="prose prose-neutral dark:prose-invert max-w-none" v-html="renderedContent"></div>

      <!-- 标签区域 -->
      <section v-if="post.tags && post.tags.length > 0" class="mt-12 pt-6 border-t border-dashed">
        <div class="flex flex-wrap gap-2">
          <NuxtLink v-for="tag in post.tags" :key="tag.id" :to="`/tag/${tag.slug}`">
            <Badge variant="secondary" class="font-normal px-3 py-0.5 hover:bg-secondary/80 transition-colors"> # {{ tag.name }} </Badge>
          </NuxtLink>
        </div>
      </section>

      <!-- 文章底部导航 -->
      <footer class="mt-16 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="ghost" as-child size="sm">
          <NuxtLink to="/">← 返回列表</NuxtLink>
        </Button>

        <div class="text-xs text-muted-foreground italic">最后更新于 {{ formatDate(post.updatedAt) }}</div>
      </footer>
    </article>

    <!-- 文章未找到 -->
    <div v-else class="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
      <h2 class="text-2xl font-bold mb-4">404</h2>
      <p class="text-muted-foreground mb-8">抱歉，您查看的文章可能已被删除或不存在。</p>
      <Button as-child>
        <NuxtLink to="/">返回首页</NuxtLink>
      </Button>
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/styles/tailwind.css";

/* Markdown 样式增强 - 深度作用于 v-html 内容 */
.prose :deep(h1) {
  @apply text-3xl font-bold mt-10 mb-5 pb-3 border-b;
}

.prose :deep(h2) {
  @apply text-2xl font-bold mt-8 mb-4 pb-2 border-b;
}

.prose :deep(h3) {
  @apply text-xl font-semibold mt-6 mb-3;
}

.prose :deep(p) {
  @apply mb-4 leading-7 text-pretty;
}

.prose :deep(a) {
  @apply text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all;
}

.prose :deep(code) {
  @apply bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground;
}

.prose :deep(pre) {
  @apply bg-muted p-4 rounded-lg overflow-x-auto my-6 border shadow-sm;
}

.prose :deep(pre code) {
  @apply bg-transparent p-0 border-none shadow-none;
}

.prose :deep(blockquote) {
  @apply border-l-4 border-primary/50 pl-4 my-6 text-muted-foreground italic bg-muted/30 py-2 pr-4 rounded-r;
}

.prose :deep(ul) {
  @apply list-disc pl-6 my-4 space-y-2;
}

.prose :deep(ol) {
  @apply list-decimal pl-6 my-4 space-y-2;
}

.prose :deep(img) {
  @apply max-w-full h-auto rounded-xl my-8 mx-auto shadow-md;
}

.prose :deep(table) {
  @apply w-full border-collapse my-6 text-sm;
}

.prose :deep(th),
.prose :deep(td) {
  @apply border border-border px-4 py-2 text-left;
}

.prose :deep(th) {
  @apply bg-muted font-bold;
}

.prose :deep(hr) {
  @apply border-t border-border my-10;
}
</style>
