import { createRouter, createWebHistory } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase_config';
import { authService } from '@/services/auth_service';
import { logInfo, logError } from '@/utils/logger.js';

// Componentes
import ContainerDashboard from "@/components/Dashboard/Home/ContainerDashboard.vue";
import ContainerDashboardAdmin from "@/components/DashboardAdmin/Home/ContainerDashboard.vue";
import ContainerMembership from "@/components/Dashboard/Membership/ContainerMembership.vue";
import ContainerWallet from "@/components/Dashboard/Wallet/ContainerWallet.vue";
import ContainerProfile from "@/components/Dashboard/Profile/ContainerProfile.vue";
import HomeViewAdmin from "@/views/Admin/HomeViewAdmin.vue";
import ContainerUsers from "@/components/DashboardAdmin/User/ContainerUsers.vue";
import ContainerContratos from "@/components/DashboardAdmin/Contratos/ContainerContratos.vue";

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

let authInitialized = false;

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  try {
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

    if (requiresAuth) {
      if (!currentUser) {
        logInfo('Acceso denegado: se requiere autenticación');
        next('/login');
      } else {
        // Verificar validación del usuario
        const validationResult = await authService.checkValidationStatus(currentUser.email);
        if (!validationResult.success || !validationResult.isValidated) {
          logInfo('Usuario no validado, redirigiendo a login');
          await authService.logout();
          next('/login');
        } else {
          next();
        }
      }
    } else if (requiresGuest && currentUser) {
      // Verificar si el usuario está validado antes de redirigir al dashboard
      const validationResult = await authService.checkValidationStatus(currentUser.email);
      if (validationResult.success && validationResult.isValidated) {
        logInfo('Usuario autenticado y validado, redirigiendo al dashboard');
        next('/dashboard');
      } else {
        // Si no está validado, cerrar sesión y permitir acceso a rutas de invitados
        await authService.logout();
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    logError('Error en la navegación:', error);
    await authService.logout();
    next('/login');
  }
});

router.onError((error) => {
  logError('Error en el router:', error);
  router.push('/');
});

export default router;