<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'

const colorMode = useColorMode()

// 逻辑：在 system -> light -> dark 之间循环
const cycleTheme = () => {
  if (colorMode.preference === 'system') {
    colorMode.preference = 'light'
  } else if (colorMode.preference === 'light') {
    colorMode.preference = 'dark'
  } else {
    colorMode.preference = 'system'
  }
}
</script>

<template>
  <Button variant="outline" size="icon" @click="cycleTheme" class="relative">
    <!-- System 模式图标 -->
    <Icon 
      icon="lucide:sun-moon" 
      class="h-[1.2rem] w-[1.2rem] transition-all"
      :class="colorMode.preference === 'system' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 absolute'" 
    />
    
    <!-- Light 模式图标 -->
    <Icon 
      icon="lucide:sun" 
      class="h-[1.2rem] w-[1.2rem] transition-all"
      :class="colorMode.preference === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 absolute'" 
    />

    <!-- Dark 模式图标 -->
    <Icon 
      icon="lucide:moon" 
      class="h-[1.2rem] w-[1.2rem] transition-all"
      :class="colorMode.preference === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 absolute'" 
    />

    <span class="sr-only">Toggle theme</span>
  </Button>
</template>

<style scoped>
/* 确保隐藏的图标绝对定位，不影响按钮中心点 */
.absolute {
  position: absolute;
}
</style>