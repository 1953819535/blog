<template>
  <div class="login-page page-container">
    <div class="login-card card">
      <div class="card-header">
        <h1 class="title-2 title-center">登录</h1>
        <p class="text text-center text-base mt-sm">欢迎回到博客</p>
      </div>

      <div class="tabs">
        <button
          :class="['tab', { active: loginType === 'password' }]"
          @click="loginType = 'password'"
        >
          密码登录
        </button>
        <button
          :class="['tab', { active: loginType === 'code' }]"
          @click="loginType = 'code'"
        >
          验证码登录
        </button>
      </div>

      <form @submit.prevent="handleLogin" class="form">
        <div class="form-group">
          <label class="form-label form-label-required">邮箱</label>
          <input
            v-model="formData.email"
            type="email"
            class="input"
            placeholder="请输入邮箱"
            required
          />
        </div>

        <div v-if="loginType === 'password'" class="form-group">
          <label class="form-label form-label-required">密码</label>
          <input
            v-model="formData.password"
            type="password"
            class="input"
            placeholder="请输入密码"
            required
          />
        </div>

        <div v-else class="form-group">
          <label class="form-label form-label-required">验证码</label>
          <div class="input-group">
            <input
              v-model="formData.code"
              type="text"
              class="input"
              placeholder="请输入6位验证码"
              maxlength="6"
              required
            />
            <button
              type="button"
              class="btn btn-outline"
              @click="handleSendCode"
              :disabled="codeSending || countdown > 0"
            >
              {{ countdown > 0 ? `${countdown}s` : codeSending ? '发送中' : '获取验证码' }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="text text-center text-base mt-sm">
        还没有账号？
        <NuxtLink to="/register" class="link">立即注册</NuxtLink>
      </p>

      <div v-if="error" class="message message-error mt-sm">{{ error }}</div>
      <div v-if="success" class="message message-success mt-sm">{{ success }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onUnmounted } from 'vue'
import { handleApiError } from '~/utils/api'
import { sendLoginVerification, loginWithPassword, loginWithCode, getUserProfile } from '~/api'

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

    // 获取用户完整信息
    const userResponse = await getUserProfile()
    const userInfo = userResponse.data

    // 使用 useAuth 统一管理状态
    const userInfoToSave = {
      id: userInfo.id,
      email: userInfo.email,
      nickname: userInfo.nickname,
      avatar: userInfo.profile?.avatar || ''
    }
    setAuth(loginData.access_token, userInfoToSave)

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

<style scoped>
.login-card {
  max-width: 460px;
}

.card-header {
  margin-bottom: var(--space-md);
  text-align: center;
}
</style>
