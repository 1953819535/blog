<template>
  <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">注册</CardTitle>
        <CardDescription>创建您的博客账号</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="space-y-2">
            <Label for="nickname">用户名</Label>
            <Input
              id="nickname"
              v-model="formData.nickname"
              type="text"
              placeholder="请输入用户名（可选）"
            />
          </div>

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
            <Label for="password">密码 <span class="text-destructive">*</span></Label>
            <Input
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="confirmPassword">确认密码 <span class="text-destructive">*</span></Label>
            <Input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
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

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </Button>
        </form>

        <p class="text-center text-sm text-muted-foreground mt-6">
          已有账号？
          <NuxtLink to="/login" class="text-primary hover:underline">立即登录</NuxtLink>
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
import { sendRegisterVerification, register } from '~/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const { setAuth } = useAuth()

const formData = reactive({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  code: ''
})

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
    const response = await sendRegisterVerification(formData.email)
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

const handleRegister = async () => {
  // 验证密码一致性
  if (formData.password !== formData.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await register(formData)
    const registerData = response.data

    // 注册接口已返回完整用户信息，直接保存
    setAuth(registerData.access_token, registerData.user)

    success.value = '注册成功！即将跳转...'

    // 使用 navigateTo 进行客户端导航
    await new Promise(resolve => setTimeout(resolve, 500))
    await navigateTo('/')
  } catch (err) {
    error.value = handleApiError(err)
    // 如果失败,清理可能不完整的数据
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
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
