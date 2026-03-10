<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-bold">分类管理</h1>
      <Button size="sm" @click="openCreateDialog">
        <Icon icon="lucide:plus" class="mr-1.5 h-3.5 w-3.5" />
        新建
      </Button>
    </div>

    <!-- 分类列表 -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-12 bg-muted/50 rounded-lg animate-pulse" />
    </div>

    <div v-else-if="categories.length === 0" class="text-center py-16 border rounded-xl border-dashed">
      <p class="text-xs text-muted-foreground uppercase tracking-widest">暂无分类</p>
    </div>

    <div v-else class="divide-y divide-border/40">
      <div
        v-for="category in categories"
        :key="category.id"
        class="group flex items-center justify-between py-3 px-1 hover:bg-muted/20 transition-all"
      >
        <div class="flex items-center gap-3">
          <span class="text-[10px] font-bold uppercase tracking-tight text-primary w-16">
            {{ category.slug }}
          </span>
          <span class="text-[15px] font-medium">{{ category.name }}</span>
          <span v-if="category.description" class="text-xs text-muted-foreground hidden sm:inline">
            {{ category.description }}
          </span>
        </div>
        
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" class="h-7 w-7" @click="openEditDialog(category)">
            <Icon icon="lucide:edit" class="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" class="h-7 w-7 hover:text-destructive" @click="handleDelete(category)">
            <Icon icon="lucide:trash-2" class="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-base">{{ isEditing ? '编辑分类' : '新建分类' }}</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-1.5">
            <Label for="name" class="text-xs">名称 <span class="text-destructive">*</span></Label>
            <Input id="name" v-model="form.name" placeholder="分类名称" required class="h-9" />
          </div>
          <div class="space-y-1.5">
            <Label for="slug" class="text-xs">Slug <span class="text-destructive">*</span></Label>
            <Input id="slug" v-model="form.slug" placeholder="url-slug" required class="h-9" />
          </div>
          <div class="space-y-1.5">
            <Label for="description" class="text-xs">描述</Label>
            <Textarea id="description" v-model="form.description" placeholder="可选" rows="2" class="text-[13px]" />
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
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Icon } from '@iconify/vue'
import { getCategories, createCategory, updateCategory, deleteCategory, type Category } from '~/api'
import { handleApiError } from '~/utils/api'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const loading = ref(true)
const categories = ref<Category[]>([])
const dialogOpen = ref(false)
const isEditing = ref(false)
const editingId = ref('')
const submitting = ref(false)

const form = ref({
  name: '',
  slug: '',
  description: ''
})

const openCreateDialog = () => {
  isEditing.value = false
  editingId.value = ''
  form.value = { name: '', slug: '', description: '' }
  dialogOpen.value = true
}

const openEditDialog = (category: Category) => {
  isEditing.value = true
  editingId.value = category.id
  form.value = {
    name: category.name,
    slug: category.slug,
    description: category.description || ''
  }
  dialogOpen.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEditing.value) {
      await updateCategory(editingId.value, form.value)
    } else {
      await createCategory(form.value)
    }
    dialogOpen.value = false
    await fetchCategories()
  } catch (error) {
    alert(handleApiError(error))
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (category: Category) => {
  if (!confirm(`确定要删除分类「${category.name}」吗？`)) return

  try {
    await deleteCategory(category.id)
    categories.value = categories.value.filter(c => c.id !== category.id)
  } catch (error) {
    alert(handleApiError(error))
  }
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)
</script>