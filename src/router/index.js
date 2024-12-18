import { createRouter, createWebHistory } from 'vue-router';
import ContainerDashboard from "@/components/Dashboard/Home/ContainerDashboard.vue";
import Membership from "@/views/Membership.vue";
import ContainerMembership from "@/components/Dashboard/Membership/ContainerMembership.vue";
import ContainerWallet from "@/components/Dashboard/Wallet/ContainerWallet.vue";

const Inicio = () => import("@/views/InicioScreen.vue");
const LoginScreen = () => import("@/views/LoginScreen.vue");
const CreateAccountScreen = () => import("@/views/CreateAccountScreen.vue");
const HomeScreen = () => import("@/views/HomeScreen.vue");

const isAuthenticated = () => {
  return localStorage.getItem("authToken") !== null;
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'inicio',
      component: Inicio,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginScreen,
    },
    {
      path: '/register',
      name: 'register',
      component: CreateAccountScreen,
    },

    // Rutas protegidas (Dashboard)
    {
      path: '/dashboard',
      component: HomeScreen,
      meta: { requiresAuth: false }, // Indica que requiere autenticación
      children: [
        {
          path: '',
          name: 'dashboard',
          component: ContainerDashboard,
        },
        {
          path: 'membership',
          name: 'membership',
          component: ContainerMembership,
        },
        {
          path: 'wallet',
          name: 'wallet',
          component: ContainerWallet,
        }
      ],
    },


  ],
});

// Guard para proteger rutas privadas
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'login' }); // Redirige al login si no está autenticado
  } else {
    next(); // Permite el acceso
  }
});

export default router;
