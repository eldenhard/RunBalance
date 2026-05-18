import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-05-18',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@vite-pwa/nuxt'],
  app: {
    head: {
      htmlAttrs: {
        lang: 'ru'
      },
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'RunBalance' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'format-detection', content: 'telephone=no' }
      ]
    }
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],
  css: ['~/assets/css/tailwind.css', 'maplibre-gl/dist/maplibre-gl.css'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'RunBalance',
      short_name: 'RunBalance',
      description: 'Local-first running assistant for training, routes, recovery, and shoe mileage.',
      theme_color: '#111827',
      background_color: '#f8fafc',
      display: 'standalone',
      display_override: ['standalone'],
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
