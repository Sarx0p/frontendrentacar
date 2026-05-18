<template>
  <div
    class="min-h-screen transition-colors"
    :class="isDark ? 'bg-gray-950' : 'bg-gray-50'"
    style="font-family: 'Sora', sans-serif;"
  >

    <!-- Page header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1
            class="text-2xl font-extrabold transition-colors"
            :class="isDark ? 'text-gray-100' : 'text-gray-900'"
          >Dashboard</h1>
          <p
            class="text-sm mt-0.5 transition-colors"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >Bienvenido de nuevo, <span class="font-semibold" style="color:#c0392b;">Usuario</span> — aquí está el resumen de hoy.</p>
        </div>
        <div
          class="flex items-center gap-2 text-xs rounded-xl px-4 py-2 shadow-sm border transition-colors"
          :class="isDark
            ? 'text-gray-500 bg-gray-900 border-gray-800'
            : 'text-gray-400 bg-white border-gray-200'"
        >
          <i
            class="pi pi-calendar transition-colors"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
          ></i>
          {{ today }}
        </div>
      </div>
    </div>

    <!-- ── STAT CARDS ── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <DashboardStatCard
        v-for="stat in stats"
        :key="stat.label"
        v-bind="stat"
      />
    </div>

    <!-- ── MIDDLE ROW: mini charts + resumen operativo ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

      <!-- Ingresos del mes -->
      <div :class="cardShell">
        <p class="text-xs font-bold uppercase tracking-widest mb-1" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Ingresos del mes</p>
        <p class="text-xs mb-4" :class="isDark ? 'text-gray-500' : 'text-gray-400'">ventas este mes</p>
        <DashboardMiniLineChart :data="incomeData" color="#c0392b" />
        <div class="flex items-center gap-1 mt-3 text-xs font-semibold" style="color:#22c55e;">
        </div>
      </div>

      <!-- Reservas activas -->
      <div :class="cardShell">
        <p class="text-xs font-bold uppercase tracking-widest mb-1" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Reservas activas</p>
        <p class="text-xs mb-4" :class="isDark ? 'text-gray-500' : 'text-gray-400'">ingresos por reservas</p>
        <DashboardMiniLineChart :data="reservasData" color="#f0a500" />
        <div class="flex items-center gap-1 mt-3 text-xs font-semibold" style="color:#f0a500;">
        </div>
      </div>

      <!-- Resumen operativo tipo bandwidth -->
      <div :class="cardShell">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-chart-pie text-sm" style="color:#c0392b;"></i>
            <p class="text-xs font-bold uppercase tracking-widest" style="color:#c0392b;">Resumen operativo</p>
          </div>
          <div class="flex gap-1">
            <button
              v-for="tab in ['Hoy','Semana']"
              :key="tab"
              type="button"
              @click="activeTab = tab"
              class="text-xs font-bold px-3 py-1 rounded-full transition-all"
              :style="activeTab === tab
                ? { background: '#c0392b', color: 'white' }
                : { color: isDark ? '#9ca3af' : '#6b7280' }"
            >{{ tab }}</button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ activeTab === 'Hoy' ? '5' : '34' }}</p>
            <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Nuevas reservas</p>
          </div>
          <div>
            <p class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ activeTab === 'Hoy' ? '$1,240' : '$8,760' }}</p>
            <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Ingresos</p>
          </div>
        </div>

        <div class="mt-4 space-y-3">
          <DashboardProgressRow label="Flota disponible" :value="72" color="#c0392b" />
          <DashboardProgressRow label="Contratos activos" :value="61" color="#f0a500" />
          <DashboardProgressRow label="Pagos al día" :value="88" color="#22c55e" />
          <DashboardProgressRow label="Mantenimientos" :value="35" color="#3b82f6" />
        </div>
      </div>
    </div>

    <!-- ── BOTTOM ROW: actividad reciente + vehículos top ── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <!-- Actividad reciente -->
      <div :class="cardShell">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">Actividad reciente</p>
          <button class="text-xs font-semibold hover:underline" style="color:#c0392b;">Ver todo</button>
        </div>
        <div class="space-y-3">
          <DashboardActivityRow
            v-for="item in activity"
            :key="item.id"
            v-bind="item"
          />
        </div>
      </div>

      <!-- Vehículos más rentados -->
      <div :class="cardShell">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">Vehículos más rentados</p>
          <button class="text-xs font-semibold hover:underline" style="color:#c0392b;">Ver flota</button>
        </div>
        <div class="space-y-3">
          <DashboardVehicleRow
            v-for="v in topVehicles"
            :key="v.plate"
            v-bind="v"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import DashboardStatCard from '@/components/dashboard/DashboardStatCard.vue'
import DashboardMiniLineChart from '@/components/dashboard/DashboardMiniLineChart.vue'
import DashboardProgressRow from '@/components/dashboard/DashboardProgressRow.vue'
import DashboardActivityRow from '@/components/dashboard/DashboardActivityRow.vue'
import DashboardVehicleRow from '@/components/dashboard/DashboardVehicleRow.vue'

const { isDark } = storeToRefs(useThemeStore())

const cardShell = computed(() =>
  isDark.value
    ? 'rounded-2xl border shadow-sm p-5 bg-gray-900 border-gray-800'
    : 'rounded-2xl border shadow-sm p-5 bg-white border-gray-100',
)

const today = computed(() =>
  new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)

const activeTab = ref('Hoy')

const stats = [
  { label: 'Total reservas', sub: 'Este mes', value: '1,248', color: '#c0392b', icon: 'pi-calendar', progress: 78, progressLabel: 'Crecimiento YoY' },
  { label: 'Vehículos', sub: 'Flota activa', value: '84', color: '#f0a500', icon: 'pi-car', progress: 84, progressLabel: 'Disponibilidad' },
  { label: 'Ingresos', sub: 'Mes actual', value: '$12.4K', color: '#3b82f6', icon: 'pi-dollar', progress: 62, progressLabel: 'Meta mensual' },
  { label: 'Clientes activos', sub: 'Registrados', value: '312', color: '#22c55e', icon: 'pi-users', progress: 91, progressLabel: 'Retención' },
]

const incomeData = [30, 55, 40, 70, 60, 80, 65, 90, 75, 95, 85, 100]
const reservasData = [20, 35, 50, 30, 60, 45, 70, 55, 80, 65, 75, 88]

const activity = [
  { id: 1, icon: 'pi-calendar-plus', iconColor: '#c0392b', iconBg: '#fef2f2', title: 'Nueva reserva — Toyota Corolla', sub: 'Cliente: María González', time: 'Hace 5 min', badge: 'Nueva', badgeColor: '#c0392b' },
  { id: 2, icon: 'pi-check-circle', iconColor: '#22c55e', iconBg: '#dcfce7', title: 'Contrato firmado #1042', sub: 'Honda Civic · ABC-456', time: 'Hace 18 min', badge: 'Completado', badgeColor: '#22c55e' },
  { id: 3, icon: 'pi-credit-card', iconColor: '#3b82f6', iconBg: '#eff6ff', title: 'Pago recibido $340', sub: 'Reserva #0981', time: 'Hace 34 min', badge: 'Pagado', badgeColor: '#3b82f6' },
  { id: 4, icon: 'pi-wrench', iconColor: '#f0a500', iconBg: '#fffbeb', title: 'Mantenimiento programado', sub: 'Nissan Sentra · XYZ-789', time: 'Hace 1 hr', badge: 'Pendiente', badgeColor: '#f0a500' },
  { id: 5, icon: 'pi-user-plus', iconColor: '#8b5cf6', iconBg: '#f5f3ff', title: 'Nuevo cliente registrado', sub: 'Carlos Mendoza', time: 'Hace 2 hrs', badge: 'Nuevo', badgeColor: '#8b5cf6' },
]

const topVehicles = [
  { name: 'Toyota Corolla', plate: 'ABC-123', type: 'Sedán', rentals: 24, revenue: '$3,120', available: false },
  { name: 'Honda Civic', plate: 'ABC-456', type: 'Sedán', rentals: 19, revenue: '$2,470', available: true },
  { name: 'Nissan X-Trail', plate: 'DEF-789', type: 'SUV', rentals: 17, revenue: '$2,890', available: true },
  { name: 'Hyundai Tucson', plate: 'GHI-321', type: 'SUV', rentals: 14, revenue: '$2,380', available: false },
  { name: 'Kia Sportage', plate: 'JKL-654', type: 'SUV', rentals: 11, revenue: '$1,870', available: true },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
</style>
