<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-gray-50'">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">Reservas</h1>
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Gestiona las reservas de vehículos</p>
      </div>
      <router-link
        :to="{ name: 'reservas-nueva' }"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
        style="background:#c0392b;"
      >
        <i class="pi pi-plus text-sm"></i>
        Nueva reserva
      </router-link>
    </div>

    <!-- Filtros -->
    <div
      class="rounded-2xl border shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" :class="isDark ? 'text-gray-500' : 'text-gray-400'"></i>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por cliente o DUI..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition"
          :class="isDark
            ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500'
            : 'border-gray-200 bg-gray-50'"
          @keyup.enter="aplicarFiltros"
        />
      </div>
      <select
        v-model="filtroEstado"
        class="px-4 py-2.5 rounded-xl border text-sm focus:outline-none min-w-[160px]"
        :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
        @change="aplicarFiltros"
      >
        <option value="">Todos los estados</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="CONFIRMADA">Confirmada</option>
        <option value="CANCELADA">Cancelada</option>
      </select>
    </div>

    <!-- Tabla -->
    <div
      class="rounded-2xl border shadow-sm overflow-hidden"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <div
        v-if="store.loading"
        class="flex items-center justify-center py-20 gap-2"
        :class="isDark ? 'text-gray-500' : 'text-gray-400'"
      >
        <i class="pi pi-spin pi-spinner"></i>
        <span class="text-sm">Cargando reservas...</span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr :style="isDark ? 'background:#111827; border-bottom:1px solid #1f2937;' : 'background:#fafafa; border-bottom:1px solid #f3f4f6;'">
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest w-14" :class="isDark ? 'text-gray-500' : 'text-gray-400'">N°</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Cliente</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Vehículo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Periodo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Tipo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Estado</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Solicitud</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, index) in reservasFiltradas"
              :key="r.id"
              class="border-b transition-colors"
              :class="isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-50 hover:bg-gray-50/80'"
            >
              <td class="px-5 py-4 font-semibold text-sm tabular-nums" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ index + 1 }}</td>

              <td class="px-5 py-4">
                <p class="font-semibold" :class="isDark ? 'text-gray-200' : 'text-gray-800'">{{ r.cliente?.nombre || '—' }}</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ r.cliente?.dui }}</p>
              </td>

              <td class="px-5 py-4">
                <p class="font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ nombreVehiculo(r.vehiculo) }}</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ r.vehiculo?.placa }}</p>
              </td>

              <td class="px-5 py-4" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                <p>{{ formatFecha(r.fecha_inicio) }}</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">→ {{ formatFecha(r.fecha_fin) }}</p>
              </td>

              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="tipoStyle(r.tipo_reserva)">
                  {{ labelTipo(r.tipo_reserva) }}
                </span>
              </td>

              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="estadoStyle(r.estado)">
                  {{ labelEstado(r.estado) }}
                </span>
              </td>

              <td class="px-5 py-4 text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                {{ formatFechaHora(r.fecha_solicitud) }}
              </td>
            </tr>

            <tr v-if="reservasFiltradas.length === 0">
              <td colspan="7" class="px-5 py-16 text-center">
                <i class="pi pi-calendar text-4xl mb-3 block" :class="isDark ? 'text-gray-700' : 'text-gray-200'"></i>
                <p class="font-medium" :class="isDark ? 'text-gray-500' : 'text-gray-400'">No se encontraron reservas</p>
                <router-link
                  :to="{ name: 'reservas-nueva' }"
                  class="inline-flex items-center gap-1.5 mt-3 text-sm font-bold"
                  style="color:#c0392b;"
                >
                  <i class="pi pi-plus text-xs"></i>
                  Crear la primera reserva
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="px-5 py-3 border-t text-xs"
        :class="isDark ? 'border-gray-800 text-gray-500' : 'border-gray-50 text-gray-400'"
      >
        {{ reservasFiltradas.length }} reserva{{ reservasFiltradas.length !== 1 ? 's' : '' }}
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReservasStore } from '@/stores/reservas'
import { useAppTheme } from '@/composables/useAppTheme'

const { isDark } = useAppTheme()
const store = useReservasStore()

const search       = ref('')
const filtroEstado = ref('')

const reservas = computed(() => store.reservas)

onMounted(() => store.fetchReservas())

const reservasFiltradas = computed(() =>
  [...reservas.value].sort((a, b) => a.id - b.id)
)

async function aplicarFiltros() {
  const params = {}
  if (filtroEstado.value) params.estado = filtroEstado.value
  if (search.value.trim()) params.buscar = search.value.trim()
  await store.fetchReservas(params)
}

function nombreVehiculo(v) {
  if (!v) return '—'
  const marca = v.modelo?.marca?.nombre
  const modelo = v.modelo?.nombre
  return [marca, modelo].filter(Boolean).join(' ') || v.placa
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  const d = new Date(typeof fecha === 'string' && !fecha.includes('T') ? fecha + 'T00:00:00' : fecha)
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatFechaHora(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-SV', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function labelEstado(estado) {
  const map = { PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', CANCELADA: 'Cancelada' }
  return map[estado] || estado
}

function labelTipo(tipo) {
  const map = { INMEDIATA: 'Inmediata', ANTISIPADA: 'Anticipada' }
  return map[tipo] || tipo
}

function estadoStyle(estado) {
  const styles = {
    PENDIENTE:  'background:#fef3c7; color:#92400e;',
    CONFIRMADA: 'background:#dcfce7; color:#166534;',
    CANCELADA:  'background:#fee2e2; color:#991b1b;',
  }
  return styles[estado] || 'background:#f3f4f6; color:#6b7280;'
}

function tipoStyle(tipo) {
  const styles = {
    INMEDIATA:  'background:#dbeafe; color:#1e40af;',
    ANTISIPADA: 'background:#f3e8ff; color:#6b21a8;',
  }
  return styles[tipo] || 'background:#f3f4f6; color:#6b7280;'
}
</script>
