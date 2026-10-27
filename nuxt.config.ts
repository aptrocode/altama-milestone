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
        // Six wall columns (the third one lit); the .ico is the fallback for older browsers.
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
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
      {
        // Operator dashboard only (client request); Quicksand has 300–700.
        name: 'Quicksand',
        provider: 'google',
        weights: [400, 500, 600, 700],
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

  experimental: {
    // Look for a new deployment every minute (default 1 h); build-reload.client.ts reloads the wall
    // so kiosk browsers (TouchDesigner Web Render) never keep running an old build.
    checkOutdatedBuildInterval: 60_000,
  },

  compatibilityDate: '2025-07-15',
});
