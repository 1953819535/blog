<template>
  <div class="forgot-password-page page-container">
    <div class="forgot-password-card card">
      <div class="card-header">
        <h1 class="title-2 title-center">重置密码</h1>
        <p class="text text-center text-base mt-sm">通过邮箱验证码重置您的密码</p>
      </div>

      <form @submit.prevent="handleResetPassword" class="form">
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

        <div class="form-group">
          <label class="form-label form-label-required">新密码</label>
          <input
            v-model="formData.newPassword"
            type="password"
            class="input"
            placeholder="请输入新密码（至少6位）"
            minlength="6"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label form-label-required">确认密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="input"
            placeholder="请再次输入新密码"
            minlength="6"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
          {{ loading ? '重置中...' : '重置密码' }}
        </button>
      </form>

      <p class="text text-center text-base mt-sm">
        想起密码了？
        <NuxtLink to="/login" class="link">返回登录</NuxtLink>
      </p>

      <div v-if="error" class="message message-error mt-sm">{{ error }}</div>
      <div v-if="success" class="message message-success mt-sm">{{ success }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onUnmounted } from 'vue'
import { handleApiError } from '~/utils/api'
import { sendResetPasswordVerification, resetPassword } from '~/api'

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

<style scoped>
.forgot-password-card {
  max-width: 460px;
}

.card-header {
  margin-bottom: var(--space-md);
  text-align: center;
}
</style>
