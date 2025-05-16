export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "shadcn-nuxt",
    "@nuxt/image",
  ],
  compatibilityDate: "2025-02-12",
});