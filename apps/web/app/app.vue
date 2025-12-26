<template>
  <div>
    <div>
      <h1>{{ message }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from "@my/prisma";
const user: User = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
};
const message = ref("");

try {
  const response = await $fetch<string>("http://localhost:3010/api");
  message.value = response;
} catch (error) {
  console.error("获取问候语失败:", error);
  message.value = "获取问候语失败";
}
</script>
