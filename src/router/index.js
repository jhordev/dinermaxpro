import { createRouter, createWebHistory } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/services/firebase_config';
import { authService } from '@/services/auth_service';
import { logInfo, logError } from '@/utils/logger.js';
import { doc, getDoc } from 'firebase/firestore';

// Componentes
import ContainerDashboard from "@/components/Dashboard/Home/ContainerDashboard.vue";
import ContainerDashboardAdmin from "@/components/DashboardAdmin/Home/ContainerDashboard.vue";
import ContainerMembership from "@/components/Dashboard/Membership/ContainerMembership.vue";
import ContainerWallet from "@/components/Dashboard/Wallet/ContainerWallet.vue";
import ContainerProfile from "@/components/Dashboard/Profile/ContainerProfile.vue";
import HomeViewAdmin from "@/views/HomeAdminView.vue";
import ContainerUsers from "@/components/DashboardAdmin/User/ContainerUsers.vue";
import ContainerContratos from "@/components/DashboardAdmin/Contratos/ContainerContratos.vue";
import ContainerReferences from "@/components/DashboardAdmin/ReferencesSocios/ContainerReferences.vue";
import ContainerPlanes from "@/components/DashboardAdmin/Planes/ContainerPlanes.vue";
import ContainerConfig from "@/components/DashboardAdmin/Config/ContainerConfig.vue";
import ContainerAsistens from "@/components/DashboardAdmin/Asistentes/ContainerAsistens.vue";
import Wallets from "@/components/DashboardAdmin/Config/Wallets/Wallets.vue";
import Recompensas from "@/components/DashboardAdmin/Config/Pocentaje.vue";
import Profile from "@/components/DashboardAdmin/Profile/Profile.vue";
import ContainerOperations from "@/components/DashboardAdmin/Operations/ContainerOperations.vue";

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
        path: 'references',
        name: 'references',
        component: ContainerReferences,
      },
      {
        path: 'profileuser',
        name: 'profileuser',
        component: ContainerProfile,
      }
    ],
  },
  {
    path: '/admin',
    component: HomeViewAdmin,
    meta: {
      requiresAuth: false,
      requiresAdmin: false
    },
    children: [
      {
        path: '',
        name: 'dashboardAdmin',
        component: ContainerDashboardAdmin,
      },
      {
        path: 'user',
        name: 'user',
        component: ContainerUsers,
      },
      {
        path: 'contracts',
        name: 'contracts',
        component: ContainerContratos,
      },
      {
        path: 'plans',
        name: 'plans',
        component: ContainerPlanes,
      },
      {
        path: 'operation',
        name: 'operation',
        component: ContainerOperations,
      },
      {
        path: 'configurations',
        name: 'configurations',
        component: ContainerConfig,
        meta: { requiresAdmin: true, adminOnly: true },
        redirect: { name: 'wallets' },
        children:[
          {
            path: 'wallets',
            name: 'wallets',
            component: Wallets,
            meta: { adminOnly: true }
          },
          {
            path: 'recompensas',
            name: 'recompensas',
            component: Recompensas,
            meta: { adminOnly: true }
          }
        ]
      },
      {
        path: 'asistentials',
        name: 'asistentials',
        component: ContainerAsistens,
      },
      {
        path: 'profile',
        name: 'profileAdmin',
        component: Profile,
      },
      {
        path: 'referidosadmin',
        name: 'referidosadmin',
        component: ContainerReferences,
      },
    ]
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
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const adminOnly = to.matched.some(record => record.meta.adminOnly);

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
    const isSessionValidated = authService.isSessionValidated();

    if (requiresAuth || requiresAdmin) {
      if (!currentUser) {
        logInfo('Acceso denegado: se requiere autenticación');
        next('/login');
        return;
      }

      if (!isSessionValidated) {
        logInfo('Sesión no validada, redirigiendo a login');
        await authService.logout();
        next('/login');
        return;
      }

      if (requiresAdmin) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userRole = userDoc.data().role;

        if (userRole !== 'admin' && userRole !== 'socio') {
          logInfo('Acceso denegado: se requiere rol de administrador o socio');
          next('/dashboard');
          return;
        }

        if (adminOnly && userRole !== 'admin') {
          logInfo('Acceso denegado: ruta exclusiva para administradores');
          next('/admin');
          return;
        }
      }

      next();
      return;
    }

    if (requiresGuest) {
      if (currentUser && isSessionValidated) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userRole = userDoc.data().role;

        logInfo('Usuario autenticado y validado, redirigiendo');
        if (userRole === 'admin' || userRole === 'socio') {
          next('/admin');
        } else {
          next('/dashboard');
        }
        return;
      }

      if (currentUser && !isSessionValidated) {
        await authService.logout();
      }

      next();
      return;
    }

    next();
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