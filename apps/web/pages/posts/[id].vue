<script setup lang="ts">
import { marked } from 'marked'
import { getPostById, type PostWithRelations } from '~/api'

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
  <div class="post-page">
    <!-- 加载状态 -->
    <div v-if="pending" class="loading">
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <p>加载失败: {{ error.message }}</p>
      <NuxtLink to="/" class="back-link">返回首页</NuxtLink>
    </div>

    <!-- 文章内容 -->
    <article v-else-if="post" class="post-article">
      <!-- 头部导航 -->
      <header class="post-header">
        <NuxtLink to="/" class="back-link">← 返回首页</NuxtLink>
      </header>

      <!-- 文章主体 -->
      <div class="post-content">
        <h1 class="post-title">{{ post.title }}</h1>

        <!-- 元信息 -->
        <div class="post-meta">
          <span class="post-date">{{ formatDate(post.publishedAt || post.createdAt) }}</span>
        </div>

        <!-- Markdown 内容 -->
        <div class="markdown-body" v-html="renderedContent"></div>
      </div>

      <!-- 底部 -->
      <footer class="post-footer">
        <NuxtLink to="/" class="back-link">← 返回首页</NuxtLink>
      </footer>
    </article>

    <!-- 未找到 -->
    <div v-else class="not-found">
      <p>文章不存在</p>
      <NuxtLink to="/" class="back-link">返回首页</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.post-page {
  min-height: 100vh;
  background: #fff;
}

.loading,
.error,
.not-found {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.back-link {
  color: #333;
  text-decoration: none;
  font-size: 14px;
}

.back-link:hover {
  color: #666;
  text-decoration: underline;
}

.post-article {
  max-width: 680px;
  margin: 0 auto;
  padding: 40px 20px;
}

.post-header {
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.post-content {
  display: flex;
  flex-direction: column;
}

.post-title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.post-meta {
  font-size: 14px;
  color: #999;
  margin-bottom: 40px;
}

.post-footer {
  margin-top: 60px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* Markdown 样式 */
.markdown-body {
  color: #333;
  line-height: 1.8;
  font-size: 16px;
}

.markdown-body :deep(h1) {
  font-size: 28px;
  font-weight: 600;
  margin: 40px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.markdown-body :deep(h2) {
  font-size: 24px;
  font-weight: 600;
  margin: 32px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.markdown-body :deep(h3) {
  font-size: 20px;
  font-weight: 600;
  margin: 24px 0 12px 0;
}

.markdown-body :deep(h4) {
  font-size: 18px;
  font-weight: 600;
  margin: 20px 0 10px 0;
}

.markdown-body :deep(p) {
  margin: 0 0 16px 0;
}

.markdown-body :deep(a) {
  color: #1e6bb8;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.markdown-body :deep(pre) {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 16px 0;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 16px;
  margin: 16px 0;
  color: #666;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 24px;
  margin: 16px 0;
}

.markdown-body :deep(li) {
  margin: 8px 0;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 16px 0;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.markdown-body :deep(th) {
  background: #f5f5f5;
  font-weight: 600;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #eee;
  margin: 32px 0;
}

@media (max-width: 640px) {
  .post-article {
    padding: 24px 16px;
  }

  .post-title {
    font-size: 24px;
  }

  .markdown-body {
    font-size: 15px;
  }

  .markdown-body :deep(h1) {
    font-size: 24px;
  }

  .markdown-body :deep(h2) {
    font-size: 20px;
  }

  .markdown-body :deep(h3) {
    font-size: 18px;
  }
}
</style>
