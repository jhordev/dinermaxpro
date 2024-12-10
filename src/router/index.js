import { createRouter, createWebHistory } from 'vue-router'
import Inicio from "@/views/InicioScreen.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'inicio',
      component: Inicio,
    }
  ],
})

export default router
