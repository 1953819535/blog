<template>
  <div class="md-editor-wrapper">
    <MdEditor
      v-model="content"
      :theme="theme"
      :language="language"
      :toolbars="toolbars"
      :previewTheme="previewTheme"
      :style="{ height: height }"
      :placeholder="placeholder"
      @onSave="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { ToolbarNames } from 'md-editor-v3'

interface Props {
  modelValue: string
  placeholder?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '支持 Markdown 格式...',
  height: '500px'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'save': [value: string]
}>()

// 使用系统主题
const colorMode = useColorMode()
const theme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

// 编辑器语言
const language = 'zh-CN'

// 预览主题
const previewTheme = 'github'

// 工具栏配置
const toolbars: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  '-',
  'strikeThrough',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'title',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  '-',
  'revoke',
  'next',
  '=',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'catalog'
]

// 内容双向绑定
const content = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})

// 保存快捷键处理
const handleSave = (value: string) => {
  emit('save', value)
}
</script>

<style scoped>
.md-editor-wrapper {
  width: 100%;
}

/* 暗黑模式适配 */
:deep(.md-editor) {
  --md-bk-color: transparent;
}

:deep(.md-editor-dark) {
  --md-bk-color: transparent;
}
</style>