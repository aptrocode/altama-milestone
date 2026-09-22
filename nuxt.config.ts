import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  ssr: false,

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
      htmlAttrs: {
        lang: 'id',
      },
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      ],
      title: 'Altama Interactive Milestone',
    },
  },
  modules: ['@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      sensorEnabled: false,
      sensorWsUrl: '',
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  devtools: {
    enabled: false,
  },

  compatibilityDate: '2025-07-15',
});
