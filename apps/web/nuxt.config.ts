// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: 3020,
    host: '0.0.0.0' // 允许所有主机访问
  },
  css: ['~/assets/styles/design-system.css', '~/assets/styles/common.css']
})
