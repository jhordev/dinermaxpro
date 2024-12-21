import { createRouter, createWebHistory } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase_config';
import { logInfo, logError } from '@/utils/logger.js';

// Componentes
import ContainerDashboard from "@/components/Dashboard/Home/ContainerDashboard.vue";
import ContainerMembership from "@/components/Dashboard/Membership/ContainerMembership.vue";
import ContainerWallet from "@/components/Dashboard/Wallet/ContainerWallet.vue";
import ContainerProfile from "@/components/Dashboard/Profile/ContainerProfile.vue";

// Vistas con lazy loading
const Inicio = () => import("@/views/InicioView.vue");
const LoginScreen = () => import("@/views/LoginView.vue");
const CreateAccountScreen = () => import("@/views/CreateAccountView.vue");
const HomeScreen = () => import("@/views/HomeView.vue");

const routes = [
  {
    path: '/',
    name: 'inicio',
    component: Inicio,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginScreen,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: CreateAccountScreen,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    component: HomeScreen,
    meta: { requiresAuth: true },
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
      },
      {
        path: 'profile',
        name: 'profile',
        component: ContainerProfile,
      }
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Variable para controlar el estado de inicialización de Firebase Auth
let authInitialized = false;

// Guardia de navegación
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  try {
    // Esperar a que Firebase Auth inicialice en la primera carga
    if (!authInitialized) {
      await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          authInitialized = true;
          resolve(user);
        });
      });
    }

    const currentUser = auth.currentUser;

    // Lógica de navegación
    if (requiresAuth && !currentUser) {
      logInfo('Acceso denegado: se requiere autenticación');
      next('/login');
    } else if (requiresGuest && currentUser) {
      logInfo('Redirigiendo: usuario ya autenticado');
      next('/dashboard');
    } else {
      next();
    }
  } catch (error) {
    logError('Error en la navegación:', error);
    next('/login');
  }
});

// Manejo de errores globales de navegación
router.onError((error) => {
  logError('Error en el router:', error);
  router.push('/');
});

export default router;