<script setup lang="ts">
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/github-dark.css'

import { getPostById, type PostWithRelations } from '~/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

definePageMeta({ layout: 'default' })

// 1. 静态配置：Marked 渲染器
const renderer = {
  // 新版 marked 的 code 接收一个对象参数 (token)
  // 我们直接从中解构出 text (即代码内容) 和 lang (语言)
  code({ text, lang }: { text: string; lang?: string }) {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
    const highlighted = hljs.highlight(text, { language }).value
    return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
  },
}

marked.use({ gfm: true, breaks: true, renderer })

// 2. 状态与数据获取
const colorMode = useColorMode()
const { params } = useRoute()
const postId = params.id as string

const { data: post, pending, error } = await useLazyAsyncData<PostWithRelations>(`post-${postId}`, () => getPostById(postId).then((res) => res.data))

// 3. 计算属性与 Meta
const renderedContent = computed(() => (post.value?.content ? marked.parse(post.value.content) : ''))

useHead({
  title: () => post.value?.title || '文章详情',
  meta: [{ name: 'description', content: () => post.value?.excerpt || '' }],
})

// 4. 工具函数
const formatDate = (date: Date | string | null) => {
  if (!date) return ''
  return new Date(date)
    .toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-')
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground transition-colors duration-300">
    <!-- 加载状态 -->
    <div v-if="pending" class="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <Skeleton class="h-12 w-3/4" />
      <div class="flex gap-4"><Skeleton class="h-4 w-20" /><Skeleton class="h-4 w-20" /></div>
      <Separator />
      <div class="space-y-4 pt-4"><Skeleton class="h-4 w-full" v-for="i in 3" :key="i" /></div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="max-w-3xl mx-auto px-4 py-12 text-center">
      <Alert variant="destructive" class="text-left">
        <AlertDescription>加载失败: {{ error.message }}</AlertDescription>
      </Alert>
      <Button variant="outline" as-child class="mt-6"><NuxtLink to="/">← 返回首页</NuxtLink></Button>
    </div>

    <!-- 文章正文 -->
    <article v-else-if="post" class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header class="mb-8 space-y-4">
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-balance">{{ post.title }}</h1>
        <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span class="font-medium text-foreground">@{{ post.author?.nickname }}</span>
          <Separator orientation="vertical" class="h-4" />
          <time>{{ formatDate(post.publishedAt || post.createdAt) }}</time>
          <template v-if="post.category">
            <Separator orientation="vertical" class="h-4" />
            <NuxtLink :to="`/category/${post.category.slug}`" class="hover:text-primary transition-colors">
              {{ post.category.name }}
            </NuxtLink>
          </template>
        </div>
        <Separator />
      </header>

      <!-- Markdown 内容 -->
      <div class="markdown-body" :data-color-mode="colorMode.value" v-html="renderedContent"></div>

      <footer class="mt-12 space-y-8">
        <!-- 标签区 -->
        <div v-if="post.tags?.length" class="flex flex-wrap gap-2 pt-6 border-t border-dashed">
          <NuxtLink v-for="tag in post.tags" :key="tag.id" :to="`/tag/${tag.slug}`">
            <Badge variant="secondary" class="font-normal"># {{ tag.name }}</Badge>
          </NuxtLink>
        </div>

        <div class="flex items-center justify-between pt-8 border-t">
          <Button variant="ghost" as-child size="sm"><NuxtLink to="/">← 返回列表</NuxtLink></Button>
          <span class="text-xs text-muted-foreground italic text-right"> 最后更新于 {{ formatDate(post.updatedAt) }} </span>
        </div>
      </footer>
    </article>
  </div>
</template>

<style scoped>
@reference "~/assets/styles/tailwind.css";

/* 统一样式管理 */
.markdown-body {
  background-color: transparent !important;
  color: inherit;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.7;
}

/* 穿透样式：表格与通用容器修复 */
:deep(.markdown-body) {
  /* 使用 Tailwind 的变量简化边框颜色映射 */
  --color-border-default: hsl(var(--border));
  --color-canvas-subtle: rgba(110, 118, 129, 0.05);

  table,
  tr,
  td,
  th {
    background-color: transparent !important;
    border-color: var(--color-border-default) !important;
  }

  tr:nth-child(2n) {
    background-color: var(--color-canvas-subtle) !important;
  }
  th {
    background-color: rgba(110, 118, 129, 0.1) !important;
  }

  pre {
    background-color: rgba(110, 118, 129, 0.1) !important;
    border: 1px solid var(--color-border-default);
    @apply rounded-lg;
  }

  code:not(pre code) {
    background-color: rgba(110, 118, 129, 0.15);
    @apply rounded px-1.5 py-0.5 font-mono text-[0.9em];
  }

  blockquote {
    @apply border-l-4 border-muted text-muted-foreground;
  }

  img {
    @apply rounded-xl shadow-sm;
  }
}

@media (max-width: 767px) {
  .markdown-body {
    font-size: 15px;
  }
}
</style>
