<template>
  <div class="py-6 sm:py-12 bg-background">
    <div class="max-w-2xl mx-auto px-4">
      <!-- Loading State -->
      <div v-if="pending" class="space-y-8">
        <Skeleton class="h-40 w-full rounded-xl" />
        <div class="space-y-4">
          <Skeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-lg" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-sm text-muted-foreground">加载失败: {{ error.message }}</p>
      </div>

      <!-- Content -->
      <div v-else-if="posts && posts.length > 0" class="space-y-10">
        <!-- 1. 置顶最新文章 (Featured) -->
        <section v-if="featuredPost">
          <NuxtLink :to="`/posts/${featuredPost.id}`" class="group block">
            <div class="p-6 rounded-2xl border bg-card hover:border-primary/30 transition-all shadow-sm">
              <!-- Meta: Category & Date -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span v-if="featuredPost.category" class="text-[10px] font-bold uppercase tracking-tight text-primary">
                    {{ featuredPost.category.name }}
                  </span>
                </div>
                <time class="text-[10px] font-mono text-muted-foreground">
                  {{ formatDate(featuredPost.publishedAt || featuredPost.createdAt) }}
                </time>
              </div>

              <h1 class="text-xl font-bold group-hover:text-primary transition-colors leading-tight mb-2">
                {{ featuredPost.title }}
              </h1>

              <p v-if="featuredPost.excerpt" class="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                {{ featuredPost.excerpt }}
              </p>

              <!-- Tags (统一高度样式) -->
              <div v-if="featuredPost.tags?.length" class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in featuredPost.tags"
                  :key="tag.name"
                  class="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium"
                >
                  #{{ tag.name }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </section>

        <!-- 2. 普通文章列表 (Compact List) -->
        <section v-if="regularPosts.length > 0" class="space-y-2">
          <div class="px-1 pb-2 border-b">
            <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Archive</h2>
          </div>

          <div class="divide-y divide-border/40">
            <NuxtLink
              v-for="post in regularPosts"
              :key="post.id"
              :to="`/posts/${post.id}`"
              class="group block py-4 hover:bg-muted/20 transition-all px-1"
            >
              <div class="flex flex-col gap-2">
                <!-- Meta: Category & Date -->
                <div class="flex items-center justify-between text-[10px] font-mono uppercase">
                  <span v-if="post.category" class="text-primary font-bold tracking-tight">
                    {{ post.category.name }}
                  </span>
                  <time class="text-muted-foreground/50">
                    {{ formatDateShort(post.publishedAt || post.createdAt) }}
                  </time>
                </div>

                <!-- Title -->
                <h3 class="text-[15px] font-semibold group-hover:text-primary transition-colors line-clamp-1">
                  {{ post.title }}
                </h3>

                <!-- Bottom Row: Excerpt & Tags (一致的标签样式) -->
                <div class="flex items-center justify-between gap-4">
                  <p v-if="post.excerpt" class="text-xs text-muted-foreground/70 line-clamp-1 flex-1">
                    {{ post.excerpt }}
                  </p>

                  <div v-if="post.tags?.length" class="hidden sm:flex gap-1.5 shrink-0">
                    <span
                      v-for="tag in post.tags.slice(0, 2)"
                      :key="tag.name"
                      class="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground/60 text-[9px] font-medium uppercase"
                    >
                      {{ tag.name }}
                    </span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </section>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 border rounded-2xl border-dashed">
        <p class="text-xs text-muted-foreground uppercase tracking-widest">No posts found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPosts, type PostWithRelations } from '~/api'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({ layout: 'default' })

// Data Fetching
const {
  data: posts,
  pending,
  error,
} = await useLazyAsyncData<PostWithRelations[]>('posts', async () => {
  const response = await getPosts()
  return response.data
})

// Logic
const featuredPost = computed(() => posts.value?.[0] || null)
const regularPosts = computed(() => posts.value?.slice(1) || [])

// Utils
function formatDate(date: Date | string | null) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`
}

function formatDateShort(date: Date | string | null) {
  if (!date) return ''
  const d = new Date(date)
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`
}
</script>

<style scoped>
/* 保持极简，不添加额外 CSS */
</style>
