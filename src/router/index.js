import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('../views/UsuariosView.vue'),
          meta: { requiresAdmin: true },
        },
        { path: 'clientes', name: 'clientes', component: () => import('../views/ClientesView.vue') },
        { path: 'vehiculos', name: 'vehiculos', component: () => import('../views/VehiculosView.vue') },
        { path: 'reservas', name: 'reservas', component: () => import('../views/ReservasView.vue') },
        { path: 'reservas/nueva', name: 'reservas-nueva', component: () => import('../views/ReservaCrearView.vue') },
        { path: 'contratos', name: 'contratos', component: () => import('../views/ContratosView.vue') },
        { path: 'contratos/nuevo', name: 'contratos-nuevo', component: () => import('../views/ContratoCrearView.vue') },
        { path: 'contratos/:id/cierre', name: 'contrato-cierre', component: () => import('../views/ContratoCierreView.vue') },
        { path: 'pagos', name: 'pagos', component: () => import('../views/PagosView.vue') },
        { path: 'reportes', name: 'reportes', component: () => import('../components/reportes/ReportesView.vue') },
        { path: 'reportes/vista', name: 'reportes-vista', component: () => import('../components/reportes/ReporteVista.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isGuestRoute = to.matched.some((record) => record.meta.guest)

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (isGuestRoute && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (to.matched.some((record) => record.meta.requiresAdmin) && !authStore.isAdmin) {
    return { name: 'dashboard' }
  }
})

export default router