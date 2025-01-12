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
    meta: { requiresAuth: true, allowedRoles: ['user'] },
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
      requiresAuth: true,
      allowedRoles: ['admin', 'socio']
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
        meta: { allowedRoles: ['admin'] },
        redirect: { name: 'wallets' },
        children:[
          {
            path: 'wallets',
            name: 'wallets',
            component: Wallets,
            meta: { allowedRoles: ['admin'] }
          },
          {
            path: 'recompensas',
            name: 'recompensas',
            component: Recompensas,
            meta: { allowedRoles: ['admin'] }
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
    return savedPosition || { top: 0 };
  }
});

let authInitialized = false;

router.beforeEach(async (to, from, next) => {
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

    if (to.matched.some(record => record.meta.requiresGuest)) {
      if (currentUser && isSessionValidated) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userRole = userDoc.data()?.role;
        next(userRole === 'user' ? '/dashboard' : '/admin');
        return;
      }
      next();
      return;
    }

    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!currentUser || !isSessionValidated) {
        logInfo('Acceso denegado: se requiere autenticación válida');
        await authService.logout();
        next('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userRole = userDoc.data()?.role;

      const hasPermission = to.matched.every(record => {
        const allowedRoles = record.meta.allowedRoles;
        return !allowedRoles || allowedRoles.includes(userRole);
      });

      if (!hasPermission) {
        logInfo(`Acceso denegado: rol ${userRole} no tiene permiso para esta ruta`);
        next(userRole === 'user' ? '/dashboard' : '/admin');
        return;
      }
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