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
        name: 'Roboto',
        provider: 'google',
        weights: [400, 500, 600, 700, 800, 900],
        styles: ['normal'],
        global: true,
      },
    ],
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server only (NUXT_DASHBOARD_PASSWORD): /dashboard asks for it; empty leaves the dashboard open.
    dashboardPassword: '',
    // Server only (NUXT_SETTINGS_DB): SQLite file behind /api/settings.
    settingsDb: '.data/altama.sqlite',
    public: {
      // NUXT_PUBLIC_SETTINGS_SYNC_URL: follow another server's settings (e.g. the VPS from the
      // event PC); empty = this server.
      settingsSyncUrl: '',
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
