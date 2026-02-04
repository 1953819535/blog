<template>
  <div class="min-h-screen bg-background flex flex-col">
    <AppHeader />

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t py-6">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-3">
        <p class="text-center text-sm text-muted-foreground">
          &copy; {{ new Date().getFullYear() }} Blog. All rights reserved.
        </p>

        <!-- GitHub 图标入口 -->
        <a
          href="https://github.com/1953819535"
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon icon="mdi:github" class="w-5 h-5" />
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import { Icon } from '@iconify/vue'
</script>
