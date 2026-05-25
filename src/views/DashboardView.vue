<template>
  <div
    class="min-h-screen transition-colors"
    :class="isDark ? 'bg-gray-950' : 'bg-gray-50'"
    style="font-family: 'Sora', sans-serif;"
  >

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <i class="pi pi-spin pi-spinner text-3xl" style="color:#c0392b;"></i>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex items-center justify-center h-64">
      <p class="text-red-500 text-sm">{{ error }}</p>
    </div>

    <template v-else>

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
            >Bienvenido de nuevo, <span class="font-semibold" style="color:#c0392b;">{{ authStore.user?.nombre ?? 'Usuario' }}</span> — aquí está el resumen de hoy.</p>
          </div>
          <div
            class="flex items-center gap-2 text-xs rounded-xl px-4 py-2 shadow-sm border transition-colors"
            :class="isDark
              ? 'text-gray-500 bg-gray-900 border-gray-800'
              : 'text-gray-400 bg-white border-gray-200'"
          >
            <i class="pi pi-calendar" :class="isDark ? 'text-gray-500' : 'text-gray-400'"></i>
            {{ today }}
          </div>
        </div>
      </div>

      <!-- STAT CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <DashboardStatCard
          v-for="stat in stats"
          :key="stat.label"
          v-bind="stat"
        />
      </div>

      <!-- FILA MEDIA -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        <!-- Reservas por mes -->
        <div :class="cardShell">
          <p class="text-xs font-bold uppercase tracking-widest mb-1"
             :class="isDark ? 'text-gray-500' : 'text-gray-400'">Reservas del año</p>
          <p class="text-xs mb-4"
             :class="isDark ? 'text-gray-500' : 'text-gray-400'">por mes — {{ new Date().getFullYear() }}</p>
          <DashboardMiniLineChart :data="incomeData" color="#c0392b" />
        </div>

        <!-- Flota por estado (donut) -->
        <div :class="cardShell">
          <p class="text-xs font-bold uppercase tracking-widest mb-1"
             :class="isDark ? 'text-gray-500' : 'text-gray-400'">Flota por estado</p>
          <p class="text-xs mb-4"
             :class="isDark ? 'text-gray-500' : 'text-gray-400'">distribución actual</p>
          <DashboardDonutChart :data="donutData" />
        </div>

        <!-- Resumen operativo -->
        <div :class="cardShell">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <i class="pi pi-chart-pie text-sm" style="color:#c0392b;"></i>
              <p class="text-xs font-bold uppercase tracking-widest" style="color:#c0392b;">Resumen operativo</p>
            </div>
            <div class="flex gap-1">
              <button
                v-for="tab in ['Hoy', 'Mes']"
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

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">
                {{ activeTab === 'Hoy' ? resumen.reservas_dia : resumen.reservas_mes }}
              </p>
              <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Reservas</p>
            </div>
            <div>
              <p class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">
                {{ resumen.clientes_registrados }}
              </p>
              <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Clientes</p>
            </div>
          </div>

          <div class="space-y-3">
            <DashboardProgressRow
              label="Flota disponible"
              :value="pctDisponible"
              color="#22c55e"
            />
            <DashboardProgressRow
              label="Vehículos ocupados"
              :value="pctOcupados"
              color="#f0a500"
            />
            <DashboardProgressRow
              label="Reservas del mes"
              :value="Math.min(resumen.reservas_mes, 100)"
              color="#c0392b"
            />
            <DashboardProgressRow
              label="Clientes registrados"
              :value="Math.min(resumen.clientes_registrados, 100)"
              color="#3b82f6"
            />
          </div>
        </div>
      </div>

      <!-- FILA INFERIOR -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Últimas reservas -->
        <div :class="cardShell">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">
              Últimas reservas
            </p>
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

        <!-- Estado de la flota -->
        <div :class="cardShell">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">
              Estado de la flota
            </p>
            <button class="text-xs font-semibold hover:underline" style="color:#c0392b;">Ver flota</button>
          </div>
          <div class="space-y-3">
            <div
              v-for="v in vehiculosPorEstado"
              :key="v.estado"
              class="flex items-center justify-between py-2 border-b last:border-0 transition-colors"
              :class="isDark ? 'border-gray-800' : 'border-gray-100'"
            >
              <div class="flex items-center gap-3">
                <span
                  class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  :style="{ background: estadoColor(v.estado) }"
                ></span>
                <span
                  class="text-sm font-semibold"
                  :class="isDark ? 'text-gray-200' : 'text-gray-700'"
                >{{ estadoLabel(v.estado) }}</span>
              </div>
              <span
                class="text-xs font-bold px-3 py-1 rounded-full"
                :style="{ background: estadoColor(v.estado) + '20', color: estadoColor(v.estado) }"
              >{{ v.total }} vehículos</span>
            </div>
          </div>
        </div>

      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppTheme }        from '@/composables/useAppTheme'
import { useAuthStore }       from '@/stores/auth'
import api                    from '@/services/api'
import DashboardStatCard      from '@/components/dashboard/DashboardStatCard.vue'
import DashboardMiniLineChart from '@/components/dashboard/DashboardMiniLineChart.vue'
import DashboardProgressRow   from '@/components/dashboard/DashboardProgressRow.vue'
import DashboardActivityRow   from '@/components/dashboard/DashboardActivityRow.vue'
import DashboardDonutChart    from '@/components/dashboard/DashboardDonutChart.vue'

const { isDark } = useAppTheme()
const authStore  = useAuthStore()

const cardShell = computed(() =>
  isDark.value
    ? 'rounded-2xl border shadow-sm p-5 bg-gray-900 border-gray-800'
    : 'rounded-2xl border shadow-sm p-5 bg-white border-gray-100',
)

const today = computed(() =>
  new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }),
)

// ── estado ──
const activeTab  = ref('Hoy')
const loading    = ref(true)
const error      = ref(null)

const resumen            = ref({ reservas_dia: 0, reservas_mes: 0, clientes_registrados: 0, vehiculos_disponibles: 0, vehiculos_ocupados: 0 })
const reservasPorMes     = ref([])
const vehiculosPorEstado = ref([])
const ultimasReservas    = ref([])

// ── fetch con api.js — token automático ──
async function fetchDashboard() {
  try {
    loading.value = true
    const { data } = await api.get('/dashboard/resumen')

    resumen.value            = data.resumen
    reservasPorMes.value     = data.graficas.reservas_por_mes
    vehiculosPorEstado.value = data.graficas.vehiculos_por_estado
    ultimasReservas.value    = data.ultimas_reservas
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboard)

// ── porcentajes flota ──
const totalFlota = computed(() =>
  (resumen.value.vehiculos_disponibles ?? 0) + (resumen.value.vehiculos_ocupados ?? 0)
)
const pctDisponible = computed(() =>
  totalFlota.value ? Math.round((resumen.value.vehiculos_disponibles / totalFlota.value) * 100) : 0
)
const pctOcupados = computed(() =>
  totalFlota.value ? Math.round((resumen.value.vehiculos_ocupados / totalFlota.value) * 100) : 0
)

// ── estados en MAYÚSCULAS (como devuelve la API) ──
const colorMap = {
  DISPONIBLE:    '#22c55e',
  RESERVADO:     '#f0a500',
  RENTADO:       '#3b82f6',
  MANTENIMIENTO: '#ef4444',
}

const labelMap = {
  DISPONIBLE:    'Disponible',
  RESERVADO:     'Reservado',
  RENTADO:       'Rentado',
  MANTENIMIENTO: 'Mantenimiento',
}

function estadoColor(estado) {
  return colorMap[estado] ?? '#9ca3af'
}

function estadoLabel(estado) {
  return labelMap[estado] ?? estado
}

// ── stat cards ──
const stats = computed(() => [
  {
    label: 'Reservas hoy',
    sub: 'Fecha actual',
    value: String(resumen.value.reservas_dia ?? 0),
    color: '#c0392b',
    icon: 'pi-calendar',
    progress: Math.min((resumen.value.reservas_dia ?? 0) * 10, 100),
    progressLabel: 'Del día',
  },
  {
    label: 'Reservas mes',
    sub: 'Mes actual',
    value: String(resumen.value.reservas_mes ?? 0),
    color: '#f0a500',
    icon: 'pi-calendar-plus',
    progress: Math.min((resumen.value.reservas_mes ?? 0) / 2, 100),
    progressLabel: 'Volumen mensual',
  },
  {
    label: 'Vehículos disp.',
    sub: 'Flota activa',
    value: String(resumen.value.vehiculos_disponibles ?? 0),
    color: '#3b82f6',
    icon: 'pi-car',
    progress: pctDisponible.value,
    progressLabel: 'Disponibilidad',
  },
  {
    label: 'Clientes',
    sub: 'Registrados',
    value: String(resumen.value.clientes_registrados ?? 0),
    color: '#22c55e',
    icon: 'pi-users',
    progress: Math.min(resumen.value.clientes_registrados, 100),
    progressLabel: 'Total registrados',
  },
])

// ── line chart: 12 meses ──
const incomeData = computed(() => {
  const arr = Array(12).fill(0)
  reservasPorMes.value.forEach(({ mes, total }) => {
    arr[mes - 1] = total
  })
  return arr
})

// ── donut ──
const donutData = computed(() =>
  vehiculosPorEstado.value.map((v) => ({
    label: estadoLabel(v.estado),
    value: v.total,
    color: estadoColor(v.estado),
  }))
)

// ── actividad reciente ──
const activity = computed(() =>
  ultimasReservas.value.map((r) => {
    const badge = estadoBadge(r.estado)
    return {
      id:         r.id,
      icon:       'pi-calendar-plus',
      iconColor:  '#c0392b',
      iconBg:     '#fef2f2',
      title:      `Reserva #${r.id} — ${r.vehiculo?.modelo?.marca?.nombre ?? ''} ${r.vehiculo?.modelo?.nombre ?? ''}`,
      sub:        `Cliente: ${r.cliente?.nombre ?? 'N/D'} · ${r.vehiculo?.placa ?? ''}`,
      time:       r.fecha_inicio,
      badge:      badge.label,
      badgeColor: badge.color,
    }
  })
)

function estadoBadge(estado) {
  const map = {
    pendiente:  { label: 'Pendiente',  color: '#f0a500' },
    activa:     { label: 'Activa',     color: '#3b82f6' },
    completada: { label: 'Completada', color: '#22c55e' },
    cancelada:  { label: 'Cancelada',  color: '#ef4444' },
  }
  return map[estado?.toLowerCase()] ?? { label: estado ?? 'Nueva', color: '#c0392b' }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
</style>
