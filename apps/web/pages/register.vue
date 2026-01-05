<template>
  <div class="register-page page-container">
    <div class="register-card card">
      <div class="card-header">
        <h1 class="title-2 title-center">注册</h1>
        <p class="text text-center text-base mt-sm">创建您的博客账号</p>
      </div>

      <form @submit.prevent="handleRegister" class="form">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="formData.nickname"
            type="text"
            class="input"
            placeholder="请输入用户名（可选）"
          />
        </div>

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

        <div class="form-group">
          <label class="form-label form-label-required">密码</label>
          <input
            v-model="formData.password"
            type="password"
            class="input"
            placeholder="请输入密码"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label form-label-required">确认密码</label>
          <input
            v-model="formData.confirmPassword"
            type="password"
            class="input"
            placeholder="请再次输入密码"
            required
          />
        </div>

        <div class="form-group">
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
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="text text-center text-base mt-sm">
        已有账号？
        <NuxtLink to="/login" class="link">立即登录</NuxtLink>
      </p>

      <div v-if="error" class="message message-error mt-sm">{{ error }}</div>
      <div v-if="success" class="message message-success mt-sm">{{ success }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onUnmounted } from 'vue'
import { handleApiError } from '~/utils/api'
import { sendRegisterVerification, register } from '~/api'

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

<style scoped>
.register-card {
  max-width: 460px;
}

.card-header {
  margin-bottom: var(--space-md);
  text-align: center;
}
</style>
