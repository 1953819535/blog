<template>
  <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">登录</CardTitle>
        <CardDescription>欢迎回到博客</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs v-model="loginType" class="w-full">
          <TabsList class="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="password">密码登录</TabsTrigger>
            <TabsTrigger value="code">验证码登录</TabsTrigger>
          </TabsList>

          <form @submit.prevent="handleLogin" class="space-y-4">
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

            <TabsContent value="password" class="mt-0 space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="password">密码 <span class="text-destructive">*</span></Label>
                  <NuxtLink to="/forgot-password" class="text-sm text-primary hover:underline">
                    忘记密码?
                  </NuxtLink>
                </div>
                <Input
                  id="password"
                  v-model="formData.password"
                  type="password"
                  placeholder="请输入密码"
                  :required="loginType === 'password'"
                />
              </div>
            </TabsContent>

            <TabsContent value="code" class="mt-0 space-y-4">
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
                    :required="loginType === 'code'"
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
            </TabsContent>

            <Button type="submit" class="w-full" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </Button>
          </form>
        </Tabs>

        <p class="text-center text-sm text-muted-foreground mt-6">
          还没有账号？
          <NuxtLink to="/register" class="text-primary hover:underline">立即注册</NuxtLink>
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
import { sendLoginVerification, loginWithPassword, loginWithCode } from '~/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'

const loginType = ref<'password' | 'code'>('password')

const formData = reactive({
  email: '',
  password: '',
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
    const response = await sendLoginVerification(formData.email)
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

const { setAuth } = useAuth()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = loginType.value === 'password'
      ? await loginWithPassword(formData.email, formData.password)
      : await loginWithCode(formData.email, formData.code)

    const loginData = response.data

    // 登录接口已返回完整用户信息，直接保存
    setAuth(loginData.access_token, loginData.user)

    success.value = '登录成功！即将跳转...'

    // 使用 navigateTo 进行客户端导航,不需要刷新页面
    await new Promise(resolve => setTimeout(resolve, 500))
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
