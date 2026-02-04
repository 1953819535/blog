// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: 3020,
    host: '0.0.0.0' // 允许所有主机访问
  },
  css: ['~/assets/styles/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['shadcn-nuxt', '@nuxtjs/color-mode'],
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  },
  colorMode: {
    classSuffix: ''
  }
})
