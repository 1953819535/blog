<template>
  <div class="min-h-screen bg-background flex flex-col">
    <AppHeader />

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t py-6">
      <div class="max-w-3xl mx-auto px-4 sm:px-6">
        <p class="text-center text-sm text-muted-foreground">
          &copy; {{ new Date().getFullYear() }} Blog. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>
