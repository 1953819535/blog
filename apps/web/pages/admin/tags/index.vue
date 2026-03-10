<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-bold">标签管理</h1>
      <Button size="sm" @click="openCreateDialog">
        <Icon icon="lucide:plus" class="mr-1.5 h-3.5 w-3.5" />
        新建
      </Button>
    </div>

    <!-- 标签列表 -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-10 bg-muted/50 rounded-lg animate-pulse" />
    </div>

    <div v-else-if="tags.length === 0" class="text-center py-16 border rounded-xl border-dashed">
      <p class="text-xs text-muted-foreground uppercase tracking-widest">暂无标签</p>
    </div>

    <div v-else class="flex flex-wrap gap-2">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="group inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
      >
        <span class="text-[10px] font-mono text-muted-foreground">#</span>
        <span class="text-sm font-medium">{{ tag.name }}</span>
        <code class="text-[10px] text-muted-foreground hidden sm:inline">{{ tag.slug }}</code>
        
        <div class="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" class="h-5 w-5" @click="openEditDialog(tag)">
            <Icon icon="lucide:edit" class="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" class="h-5 w-5 hover:text-destructive" @click="handleDelete(tag)">
            <Icon icon="lucide:trash-2" class="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-base">{{ isEditing ? '编辑标签' : '新建标签' }}</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-1.5">
            <Label for="name" class="text-xs">名称 <span class="text-destructive">*</span></Label>
            <Input id="name" v-model="form.name" placeholder="标签名称" required class="h-9" />
          </div>
          <div class="space-y-1.5">
            <Label for="slug" class="text-xs">Slug <span class="text-destructive">*</span></Label>
            <Input id="slug" v-model="form.slug" placeholder="url-slug" required class="h-9" />
            <p class="text-[10px] text-muted-foreground">用于 URL 路径，只能包含字母、数字和连字符</p>
          </div>
          <DialogFooter class="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" @click="dialogOpen = false">取消</Button>
            <Button type="submit" size="sm" :disabled="submitting">
              {{ submitting ? '保存中...' : '保存' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Icon } from '@iconify/vue'
import { getTags, createTag, updateTag, deleteTag, type Tag } from '~/api'
import { handleApiError } from '~/utils/api'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const loading = ref(true)
const tags = ref<Tag[]>([])
const dialogOpen = ref(false)
const isEditing = ref(false)
const editingId = ref('')
const submitting = ref(false)

const form = ref({
  name: '',
  slug: ''
})

const openCreateDialog = () => {
  isEditing.value = false
  editingId.value = ''
  form.value = { name: '', slug: '' }
  dialogOpen.value = true
}

const openEditDialog = (tag: Tag) => {
  isEditing.value = true
  editingId.value = tag.id
  form.value = {
    name: tag.name,
    slug: tag.slug
  }
  dialogOpen.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEditing.value) {
      await updateTag(editingId.value, form.value)
    } else {
      await createTag(form.value)
    }
    dialogOpen.value = false
    await fetchTags()
  } catch (error) {
    alert(handleApiError(error))
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (tag: Tag) => {
  if (!confirm(`确定要删除标签「${tag.name}」吗？`)) return

  try {
    await deleteTag(tag.id)
    tags.value = tags.value.filter(t => t.id !== tag.id)
  } catch (error) {
    alert(handleApiError(error))
  }
}

const fetchTags = async () => {
  loading.value = true
  try {
    const response = await getTags()
    tags.value = response.data
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchTags)
</script>