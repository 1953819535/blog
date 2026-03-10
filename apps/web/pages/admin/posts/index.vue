<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-bold">文章管理</h1>
      <Button size="sm" as-child>
        <NuxtLink to="/admin/posts/create">
          <Icon icon="lucide:plus" class="mr-1.5 h-3.5 w-3.5" />
          新建
        </NuxtLink>
      </Button>
    </div>

    <!-- 筛选 -->
    <div class="flex items-center gap-2">
      <button 
        v-for="opt in filterOptions" 
        :key="opt.value"
        @click="filterStatus = opt.value"
        class="text-[11px] font-medium uppercase tracking-wide px-2 py-1 rounded transition-colors"
        :class="filterStatus === opt.value 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- 文章列表 -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-16 bg-muted/50 rounded-lg animate-pulse" />
    </div>

    <div v-else-if="filteredPosts.length === 0" class="text-center py-16 border rounded-xl border-dashed">
      <p class="text-xs text-muted-foreground uppercase tracking-widest">暂无文章</p>
    </div>

    <div v-else class="divide-y divide-border/40">
      <NuxtLink
        v-for="post in filteredPosts"
        :key="post.id"
        :to="`/admin/posts/${post.id}/edit`"
        class="group block py-4 hover:bg-muted/20 transition-all px-1"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <!-- Meta: 分类 & 日期 -->
            <div class="flex items-center gap-2 text-[10px] font-mono uppercase mb-1.5">
              <span v-if="post.category" class="text-primary font-bold">
                {{ post.category.name }}
              </span>
              <span class="text-muted-foreground/50">
                {{ formatDate(post.createdAt) }}
              </span>
              <span 
                class="px-1.5 py-0.5 rounded text-[9px]"
                :class="post.published 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-muted text-muted-foreground'"
              >
                {{ post.published ? '已发布' : '草稿' }}
              </span>
            </div>

            <!-- 标题 -->
            <h3 class="text-[15px] font-semibold group-hover:text-primary transition-colors line-clamp-1 mb-1">
              {{ post.title }}
            </h3>

            <!-- 标签 -->
            <div v-if="post.tags?.length" class="flex flex-wrap gap-1">
              <span
                v-for="tag in post.tags.slice(0, 3)"
                :key="tag.id"
                class="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground/60 text-[9px] font-medium"
              >
                #{{ tag.name }}
              </span>
              <span v-if="post.tags.length > 3" class="text-[9px] text-muted-foreground/40">
                +{{ post.tags.length - 3 }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" class="h-7 w-7" as-child @click.prevent>
              <NuxtLink :to="`/posts/${post.id}`" target="_blank">
                <Icon icon="lucide:external-link" class="h-3.5 w-3.5" />
              </NuxtLink>
            </Button>
            <Button variant="ghost" size="icon" class="h-7 w-7 hover:text-destructive" @click.prevent="handleDelete(post)">
              <Icon icon="lucide:trash-2" class="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { getAllPosts, deletePost, type PostWithRelations } from '~/api'
import { handleApiError } from '~/utils/api'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const loading = ref(true)
const posts = ref<PostWithRelations[]>([])
const filterStatus = ref('all')

const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' }
]

const filteredPosts = computed(() => {
  if (filterStatus.value === 'all') return posts.value
  if (filterStatus.value === 'published') return posts.value.filter(p => p.published)
  if (filterStatus.value === 'draft') return posts.value.filter(p => !p.published)
  return posts.value
})

const fetchPosts = async () => {
  loading.value = true
  try {
    const response = await getAllPosts()
    posts.value = response.data
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (post: PostWithRelations) => {
  if (!confirm(`确定要删除文章「${post.title}」吗？`)) return

  try {
    await deletePost(post.id)
    posts.value = posts.value.filter(p => p.id !== post.id)
  } catch (error) {
    alert(handleApiError(error))
  }
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`
}

onMounted(fetchPosts)
</script>