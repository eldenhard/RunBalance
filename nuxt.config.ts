import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-05-18',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@vite-pwa/nuxt'],
  css: ['~/assets/css/tailwind.css'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'RunBalance',
      short_name: 'RunBalance',
      description: 'Local-first running assistant for training, routes, recovery, and shoe mileage.',
      theme_color: '#111827',
      background_color: '#f8fafc',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      icons: []
    },
    workbox: {
      navigateFallback: '/'
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  vite: {
    plugins: [tailwindcss()]
  }
})
