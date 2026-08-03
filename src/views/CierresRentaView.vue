<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-gray-50'">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">Cierres de renta</h1>
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Contratos activos pendientes de cierre</p>
      </div>
    </div>

    <!-- Filtros -->
    <div
      class="rounded-2xl border shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" :class="isDark ? 'text-gray-500' : 'text-gray-400'"></i>
        <input
          v-model="buscar"
          type="text"
          placeholder="Buscar por contrato, cliente o DUI..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition"
          :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500' : 'border-gray-200 bg-gray-50'"
        />
      </div>
    </div>

    <!-- Tabla -->
    <div
      class="rounded-2xl border shadow-sm overflow-hidden"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <div v-if="store.loading" class="flex items-center justify-center py-20 gap-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
        <i class="pi pi-spin pi-spinner"></i>
        <span class="text-sm">Cargando contratos...</span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr :style="isDark ? 'background:#111827; border-bottom:1px solid #1f2937;' : 'background:#fafafa; border-bottom:1px solid #f3f4f6;'">
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Contrato</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Cliente</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Vehículo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Periodo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Total</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Pago</th>
              <th class="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-center w-[9rem]" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in contratosFiltrados"
              :key="c.id"
              class="border-b transition-colors"
              :class="isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-50 hover:bg-gray-50/80'"
            >
              <td class="px-5 py-4 font-mono font-bold text-sm" style="color:#922b21;">{{ c.numero_contrato }}</td>
              <td class="px-5 py-4">
                <p class="font-semibold" :class="isDark ? 'text-gray-200' : 'text-gray-800'">{{ (c.cliente || c.reserva?.cliente)?.nombre || '—' }}</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ (c.cliente || c.reserva?.cliente)?.dui }}</p>
              </td>
              <td class="px-5 py-4">
                <p class="font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ nombreVehiculo(c.vehiculo || c.reserva?.vehiculo) }}</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ (c.vehiculo || c.reserva?.vehiculo)?.placa }}</p>
              </td>
              <td class="px-5 py-4" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                <p>{{ formatFechaHora12(c.fecha_hora_entrega) }}</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">→ {{ formatFechaHora12(c.fecha_hora_devolucion) }}</p>
              </td>
              <td class="px-5 py-4 tabular-nums" :class="isDark ? 'text-gray-200' : 'text-gray-800'">
                <p class="font-bold">${{ formatPrecio(totalFinalContrato(c)) }}</p>
                <p v-if="montoExtrasContrato(c) > 0" class="text-xs font-semibold mt-0.5" style="color:#d97706;">
                  +${{ formatPrecio(montoExtrasContrato(c)) }} extras
                </p>
              </td>
              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="estadoPagoStyle(c.estado_pago)">{{ labelEstadoPago(c.estado_pago) }}</span>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-center">
                  <router-link
                    :to="{ name: 'contrato-cierre', params: { id: c.id } }"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold no-underline transition-all hover:opacity-90 hover:no-underline"
                    style="background:#c0392b;"
                    title="Cerrar renta"
                  >
                    <i class="pi pi-flag text-[10px]"></i>
                    Cerrar renta
                  </router-link>
                </div>
              </td>
            </tr>

            <tr v-if="!contratosFiltrados.length">
              <td colspan="7" class="px-5 py-16 text-center">
                <i class="pi pi-flag text-4xl mb-3 block" :class="isDark ? 'text-gray-700' : 'text-gray-200'"></i>
                <p class="font-medium" :class="isDark ? 'text-gray-500' : 'text-gray-400'">No hay contratos activos pendientes de cierre</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-5 py-3 border-t text-xs" :class="isDark ? 'border-gray-800 text-gray-500' : 'border-gray-50 text-gray-400'">
        {{ contratosFiltrados.length }} contrato{{ contratosFiltrados.length !== 1 ? 's' : '' }} activo{{ contratosFiltrados.length !== 1 ? 's' : '' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useContratosStore } from '@/stores/contratos'
import { useAppTheme } from '@/composables/useAppTheme'
import {
  nombreVehiculo,
  formatPrecio,
  formatFechaHora12,
  labelEstadoPago,
  totalFinalContrato,
  montoExtrasContrato,
} from '@/utils/contratoFormatters'

const { isDark } = useAppTheme()
const store = useContratosStore()

const buscar = ref('')

onMounted(() => store.fetchContratos())

const contratosActivos = computed(() => store.contratos.filter((c) => c.estado_contrato === 'ACTIVO'))

const contratosFiltrados = computed(() => {
  let list = contratosActivos.value
  const q = buscar.value.trim().toLowerCase()
  if (q) {
    list = list.filter((c) =>
      c.numero_contrato?.toLowerCase().includes(q) ||
      c.reserva?.cliente?.nombre?.toLowerCase().includes(q) ||
      c.reserva?.cliente?.dui?.includes(q)
    )
  }
  return list
})

function estadoPagoStyle(estado) {
  const m = {
    PENDIENTE: 'background:#fee2e2; color:#991b1b;',
    PARCIAL: 'background:#fef3c7; color:#92400e;',
    PAGADO: 'background:#dcfce7; color:#166534;',
  }
  return m[estado] || 'background:#f3f4f6; color:#6b7280;'
}
</script>
