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
      title: 'Altama Interactive Wall',
    },
  },
  modules: [
    '@pinia/nuxt',
    '@nuxt/fonts',
  ],

  fonts: {
    families: [
      {
        name: 'Roboto Condensed',
        provider: 'google',
        weights: [400, 500, 600, 700, 800],
        styles: ['normal'],
        global: true,
      },
      {
        name: 'Oswald',
        provider: 'google',
        weights: [400, 500, 600, 700],
        styles: ['normal'],
        global: true,
      },
    ],
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      sensorEnabled: false,
      sensorWsUrl: '',
    },
  },

  nitro: {
    // Raw image sequences/master imports stay out of the build output (see .gitignore).
    ignore: ['**/new-assets/**'],
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
