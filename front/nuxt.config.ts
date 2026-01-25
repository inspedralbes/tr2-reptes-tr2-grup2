// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    head: {
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Descripción" },
      ],
    },
  },

  routeRules: {
    "/admin/**": { appMiddleware: "auth", ssr: false },
    "/centro/**": { appMiddleware: "auth", ssr: false },
    // Aseguramos que estas rutas se traten como estáticas
    "/talleristes/**": { prerender: true },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: Array.from({ length: 50 }, (_, i) => `/talleristes/${i + 1}`),
    },
  },
});
