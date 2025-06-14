export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "shadcn-nuxt",
    "@nuxt/image",
    "@nuxtjs/i18n",
  ],
  i18n: {
    defaultLocale: 'fr',
    locales: [
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'pt', name: 'Português', file: 'pt.json' }
    ]
  },
  compatibilityDate: "2025-02-12",
});