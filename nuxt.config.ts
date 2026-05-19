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
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'RunBalance' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#0b0b0c' }
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icons/icon-192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/icons/icon-512.png' }
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
      theme_color: '#0b0b0c',
      background_color: '#0b0b0c',
      display: 'standalone',
      display_override: ['standalone'],
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
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
