import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { currentUser, getDefaultRouteForRole } from '@/modules/auth/services/sessionService';
import type { Rol } from '@/shared/types/domain';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: Rol[];
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/pages/LoginPage.vue'),
  },
  {
    path: '/cambiar-contrasena',
    name: 'change-password',
    component: () => import('@/modules/auth/pages/ChangePasswordPage.vue'),
  },
  {
    path: '/app',
    component: () => import('@/shared/layouts/AppTabsLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        redirect: '/app/inicio',
      },
      {
        path: 'inicio',
        name: 'app-home',
        component: () => import('@/modules/dashboard/pages/HomePage.vue'),
      },
      {
        path: 'fincas',
        name: 'fincas',
        component: () => import('@/modules/fincas/pages/FarmListPage.vue'),
        meta: {
          roles: ['ganadero', 'asistente', 'veterinario'],
        },
      },
      {
        path: 'bovinos',
        name: 'bovinos',
        component: () => import('@/modules/animales/pages/BovinoListPage.vue'),
        meta: {
          roles: ['ganadero', 'asistente', 'veterinario'],
        },
      },
      {
        path: 'bovinos/:id',
        name: 'bovino-detail',
        component: () => import('@/modules/animales/pages/BovinoDetailPage.vue'),
        meta: {
          roles: ['ganadero', 'asistente', 'veterinario'],
        },
      },
      {
        path: 'calcular-peso',
        name: 'calcular-peso',
        component: () => import('@/modules/pesajes/pages/CalcularPesoPage.vue'),
        meta: {
          roles: ['ganadero', 'asistente'],
        },
      },
      {
        path: 'recordatorios',
        name: 'recordatorios',
        component: () => import('@/modules/recordatorios/pages/RemindersPage.vue'),
        meta: {
          roles: ['ganadero', 'asistente'],
        },
      },
      {
        path: 'reporte-compartido',
        name: 'shared-report',
        component: () => import('@/modules/reportes/pages/SharedReportPage.vue'),
        meta: {
          roles: ['ganadero'],
        },
      },
      {
        path: 'usuarios',
        name: 'users',
        component: () => import('@/modules/admin/pages/UserManagementPage.vue'),
        meta: {
          roles: ['admin'],
        },
      },
      {
        path: 'usuarios/crear',
        name: 'users-create',
        component: () => import('@/modules/admin/pages/CreateUserPage.vue'),
        meta: {
          roles: ['admin'],
        },
      },
      {
        path: 'usuarios/:id',
        name: 'users-detail',
        component: () => import('@/modules/admin/pages/UserDetailPage.vue'),
        meta: {
          roles: ['admin'],
        },
      },
      {
        path: 'bitacora',
        name: 'audit-log',
        component: () => import('@/modules/admin/pages/AuditLogPage.vue'),
        meta: {
          roles: ['admin'],
        },
      },
      {
        path: 'configuracion',
        name: 'settings',
        component: () => import('@/modules/settings/pages/SettingsPage.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const user = currentUser.value;
  const requiresAuth = to.matched.some((route) => route.meta.requiresAuth);
  const allowedRoles = to.matched.flatMap((route) => route.meta.roles ?? []);

  if (requiresAuth && !user) {
    return '/login';
  }

  if (to.name === 'login' && user) {
    if (user.mustChangePassword) return '/cambiar-contrasena';
    return getDefaultRouteForRole(user.role);
  }

  if (to.name === 'change-password' && (!user || !user.mustChangePassword)) {
    return user ? getDefaultRouteForRole(user.role) : '/login';
  }

  if (user && user.mustChangePassword && to.name !== 'change-password') {
    return '/cambiar-contrasena';
  }

  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return getDefaultRouteForRole(user.role);
  }

  return true;
});

export default router;
