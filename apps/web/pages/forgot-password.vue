<template>
  <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">重置密码</CardTitle>
        <CardDescription>通过邮箱验证码重置您的密码</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleResetPassword" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">邮箱 <span class="text-destructive">*</span></Label>
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="请输入邮箱"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="code">验证码 <span class="text-destructive">*</span></Label>
            <div class="flex gap-2">
              <Input
                id="code"
                v-model="formData.code"
                type="text"
                placeholder="请输入6位验证码"
                maxlength="6"
                class="flex-1"
                required
              />
              <Button
                type="button"
                variant="outline"
                @click="handleSendCode"
                :disabled="codeSending || countdown > 0"
                class="shrink-0"
              >
                {{ countdown > 0 ? `${countdown}s` : codeSending ? '发送中' : '获取验证码' }}
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="newPassword">新密码 <span class="text-destructive">*</span></Label>
            <Input
              id="newPassword"
              v-model="formData.newPassword"
              type="password"
              placeholder="请输入新密码（至少6位）"
              minlength="6"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="confirmPassword">确认密码 <span class="text-destructive">*</span></Label>
            <Input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              minlength="6"
              required
            />
          </div>

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? '重置中...' : '重置密码' }}
          </Button>
        </form>

        <p class="text-center text-sm text-muted-foreground mt-6">
          想起密码了？
          <NuxtLink to="/login" class="text-primary hover:underline">返回登录</NuxtLink>
        </p>

        <Alert v-if="error" variant="destructive" class="mt-4">
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <Alert v-if="success" class="mt-4">
          <AlertDescription>{{ success }}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'centered'
})

import { reactive, ref, onUnmounted } from 'vue'
import { handleApiError } from '~/utils/api'
import { sendResetPasswordVerification, resetPassword } from '~/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const { setAuth } = useAuth()

const formData = reactive({
  email: '',
  code: '',
  newPassword: ''
})

const confirmPassword = ref('')
const loading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)
const error = ref('')
const success = ref('')

let countdownTimer: NodeJS.Timeout | null = null

const handleSendCode = async () => {
  if (!formData.email) {
    error.value = '请先输入邮箱'
    return
  }

  codeSending.value = true
  error.value = ''

  try {
    const response = await sendResetPasswordVerification(formData.email)
    success.value = response.data.message

    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0 && countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }, 1000)

    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    error.value = handleApiError(err)
  } finally {
    codeSending.value = false
  }
}

const handleResetPassword = async () => {
  error.value = ''
  success.value = ''

  // 验证密码
  if (formData.newPassword.length < 6) {
    error.value = '密码长度至少为6位'
    return
  }

  if (formData.newPassword !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  loading.value = true

  try {
    const response = await resetPassword({
      email: formData.email,
      code: formData.code,
      newPassword: formData.newPassword
    })

    const resetData = response.data

    // 保存登录信息（自动登录）
    setAuth(resetData.access_token, resetData.user)

    success.value = '密码重置成功！正在登录...'

    // 跳转到首页
    await new Promise(resolve => setTimeout(resolve, 1000))
    await navigateTo('/')
  } catch (err) {
    error.value = handleApiError(err)
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>
