import { createRouter, createWebHistory } from "vue-router";

import Principal from "@/pages/index.vue";
import HomePageAdmin from "@/pages/paginaPrincipal-Admin.vue";
import HomePageProfes from "@/pages/paginaPrincipal-Profes.vue";

const routes = [
  { path: "/", name: "Home", component: Principal },
  { path: "/admin", name: "AdminHome", component: HomePageAdmin },
  { path: "/profes", name: "ProfesHome", component: HomePageProfes },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
