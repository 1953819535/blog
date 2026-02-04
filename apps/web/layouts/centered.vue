<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4 relative">
    <!-- 浮动的主题切换按钮（右上角） -->
    <div class="absolute top-4 right-4">
      <ClientOnly>
        <ModeToggle />
      </ClientOnly>
    </div>

    <!-- 页面内容（居中） -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import ModeToggle from '@/components/ModeToggle.vue'
</script>
