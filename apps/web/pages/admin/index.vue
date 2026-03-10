<template>
  <div class="space-y-10">
    <!-- 页面标题 -->
    <h1 class="text-lg font-bold">仪表盘</h1>

    <!-- 统计卡片 -->
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="p-4 rounded-xl border bg-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">文章</span>
          <Icon icon="lucide:file-text" class="h-4 w-4 text-muted-foreground" />
        </div>
        <div class="text-2xl font-bold">{{ stats.posts }}</div>
        <p class="text-[11px] text-muted-foreground mt-1">
          已发布 {{ stats.publishedPosts }} 篇 · 草稿 {{ stats.drafts }} 篇
        </p>
      </div>

      <div class="p-4 rounded-xl border bg-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">分类</span>
          <Icon icon="lucide:folder" class="h-4 w-4 text-muted-foreground" />
        </div>
        <div class="text-2xl font-bold">{{ stats.categories }}</div>
      </div>

      <div class="p-4 rounded-xl border bg-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">标签</span>
          <Icon icon="lucide:tag" class="h-4 w-4 text-muted-foreground" />
        </div>
        <div class="text-2xl font-bold">{{ stats.tags }}</div>
      </div>

      <div class="p-4 rounded-xl border bg-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">草稿箱</span>
          <Icon icon="lucide:edit" class="h-4 w-4 text-muted-foreground" />
        </div>
        <div class="text-2xl font-bold">{{ stats.drafts }}</div>
        <p class="text-[11px] text-muted-foreground mt-1">待发布文章</p>
      </div>
    </div>

    <!-- 快捷操作 -->
    <section>
      <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pb-2 border-b mb-4">
        快捷操作
      </h2>
      <div class="flex flex-wrap gap-2">
        <Button size="sm" as-child>
          <NuxtLink to="/admin/posts/create">
            <Icon icon="lucide:plus" class="mr-1.5 h-3.5 w-3.5" />
            新建文章
          </NuxtLink>
        </Button>
        <Button variant="outline" size="sm" as-child>
          <NuxtLink to="/admin/categories">管理分类</NuxtLink>
        </Button>
        <Button variant="outline" size="sm" as-child>
          <NuxtLink to="/admin/tags">管理标签</NuxtLink>
        </Button>
      </div>
    </section>

    <!-- 最近文章 -->
    <section>
      <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pb-2 border-b mb-4">
        最近文章
      </h2>
      
      <div v-if="recentPosts.length === 0" class="text-center py-8 border rounded-xl border-dashed">
        <p class="text-xs text-muted-foreground">暂无文章</p>
      </div>

      <div v-else class="divide-y divide-border/40">
        <NuxtLink
          v-for="post in recentPosts"
          :key="post.id"
          :to="`/admin/posts/${post.id}/edit`"
          class="group flex items-center justify-between py-3 px-1 hover:bg-muted/20 transition-all"
        >
          <span class="text-sm truncate">{{ post.title }}</span>
          <span 
            class="text-[9px] px-1.5 py-0.5 rounded shrink-0 ml-2"
            :class="post.published 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground'"
          >
            {{ post.published ? '已发布' : '草稿' }}
          </span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { getAllPosts, getCategories, getTags, type PostWithRelations, type Category, type Tag } from '~/api'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const stats = ref({
  posts: 0,
  publishedPosts: 0,
  drafts: 0,
  categories: 0,
  tags: 0
})

const recentPosts = ref<PostWithRelations[]>([])

onMounted(async () => {
  try {
    const [postsRes, categoriesRes, tagsRes] = await Promise.all([
      getAllPosts(),
      getCategories(),
      getTags()
    ])

    const posts = postsRes.data
    const categories = categoriesRes.data
    const tags = tagsRes.data

    stats.value = {
      posts: posts.length,
      publishedPosts: posts.filter(p => p.published).length,
      drafts: posts.filter(p => !p.published).length,
      categories: categories.length,
      tags: tags.length
    }

    // 最近5篇文章
    recentPosts.value = posts.slice(0, 5)
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
})
</script>