<template>
  <div class="space-y-8">
    <!-- 返回按钮 -->
    <NuxtLink to="/admin/posts" class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
      <Icon icon="lucide:arrow-left" class="h-3.5 w-3.5" />
      返回列表
    </NuxtLink>

    <!-- 页面标题 -->
    <h1 class="text-lg font-bold">新建文章</h1>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- 基本信息 -->
      <section class="space-y-4">
        <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pb-2 border-b">
          基本信息
        </h2>
        
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <Label for="title" class="text-xs">标题 <span class="text-destructive">*</span></Label>
            <Input id="title" v-model="form.title" placeholder="文章标题" required class="h-9" />
          </div>
          
          <div class="space-y-1.5">
            <Label for="slug" class="text-xs">Slug <span class="text-destructive">*</span></Label>
            <Input id="slug" v-model="form.slug" placeholder="url-friendly-slug" required class="h-9" />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <Label for="category" class="text-xs">分类</Label>
            <Select id="category" v-model="form.categoryId" class="h-9">
              <option value="">选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </Select>
          </div>

          <div class="space-y-1.5">
            <Label class="text-xs">标签</Label>
            <div class="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[36px] bg-muted/30">
              <span
                v-for="tag in selectedTags"
                :key="tag.id"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium cursor-pointer hover:bg-primary/20 transition-colors"
                @click="toggleTag(tag.id)"
              >
                {{ tag.name }}
                <Icon icon="lucide:x" class="h-3 w-3" />
              </span>
              <span v-if="selectedTags.length === 0" class="text-[11px] text-muted-foreground">
                点击下方添加
              </span>
            </div>
            <div class="flex flex-wrap gap-1 pt-1">
              <span
                v-for="tag in availableTags"
                :key="tag.id"
                class="inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
                @click="toggleTag(tag.id)"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 文章内容 -->
      <section class="space-y-4">
        <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pb-2 border-b">
          内容
        </h2>
        
        <div class="space-y-1.5">
          <Label for="content" class="text-xs">正文 (Markdown) <span class="text-destructive">*</span></Label>
          <MarkdownEditor
            v-model="form.content"
            placeholder="支持 Markdown 格式..."
            height="500px"
          />
        </div>

        <div class="space-y-1.5">
          <Label for="excerpt" class="text-xs">摘要</Label>
          <Textarea
            id="excerpt"
            v-model="form.excerpt"
            placeholder="可选，不填将自动截取内容前200字"
            rows="2"
            class="text-[13px]"
          />
        </div>
      </section>

      <!-- 发布设置 -->
      <section class="space-y-4">
        <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pb-2 border-b">
          发布
        </h2>
        
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="form.published" class="rounded h-4 w-4" />
          <span class="text-sm">立即发布</span>
          <span class="text-xs text-muted-foreground">（取消则保存为草稿）</span>
        </label>
      </section>

      <!-- 操作按钮 -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" size="sm" as-child>
          <NuxtLink to="/admin/posts">取消</NuxtLink>
        </Button>
        <Button type="submit" size="sm" :disabled="submitting">
          {{ submitting ? '保存中...' : '保存文章' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { MarkdownEditor } from '@/components/ui/markdown-editor'
import { Icon } from '@iconify/vue'
import { createPost, getCategories, getTags, type Category, type Tag } from '~/api'
import { handleApiError } from '~/utils/api'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const form = ref({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  categoryId: '',
  tagIds: [] as string[],
  published: false
})

const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const submitting = ref(false)

const selectedTags = computed(() => {
  return tags.value.filter((t: Tag) => form.value.tagIds.includes(t.id))
})

const availableTags = computed(() => {
  return tags.value.filter((t: Tag) => !form.value.tagIds.includes(t.id))
})

const toggleTag = (tagId: string) => {
  const index = form.value.tagIds.indexOf(tagId)
  if (index === -1) {
    form.value.tagIds.push(tagId)
  } else {
    form.value.tagIds.splice(index, 1)
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    // 清理数据：空字符串转为 undefined
    const data = {
      ...form.value,
      categoryId: form.value.categoryId || undefined,
      tagIds: form.value.tagIds.length > 0 ? form.value.tagIds : undefined
    }
    const response = await createPost(data)
    alert('文章创建成功！')
    navigateTo(`/admin/posts/${response.data.id}/edit`)
  } catch (error) {
    alert(handleApiError(error))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const [catRes, tagRes] = await Promise.all([
      getCategories(),
      getTags()
    ])
    categories.value = catRes.data
    tags.value = tagRes.data
  } catch (error) {
    console.error('Failed to load data:', error)
  }
})
</script>