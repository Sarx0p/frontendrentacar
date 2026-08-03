<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-gray-50'">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">Pagos</h1>
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Registro de pagos de contratos</p>
      </div>
    </div>

    <!-- Registrar pago -->
    <div
      class="rounded-2xl border shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <div class="flex-1">
        <label class="text-xs font-semibold mb-1 block" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Contrato con saldo pendiente</label>
        <select
          v-model="contratoId"
          class="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
          :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
          @change="cargarContrato"
        >
          <option value="">Seleccionar contrato...</option>
          <option v-for="c in contratosAbiertos" :key="c.id" :value="c.id">
            {{ c.numero_contrato }} — {{ (c.cliente || c.reserva?.cliente)?.nombre }} — Saldo ${{ formatPrecio(saldoDe(c)) }}
          </option>
        </select>
      </div>
      <div
        v-if="contratoSel"
        class="rounded-xl px-4 py-2.5 text-sm border shrink-0"
        :class="isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'"
      >
        <div v-if="montoExtrasSel > 0" class="text-xs opacity-60 mb-0.5">
          Renta ${{ formatPrecio(contratoSel.monto_total_renta) }} + extras ${{ formatPrecio(montoExtrasSel) }}
        </div>
        <span class="opacity-60">Saldo: </span>
        <strong style="color:#922b21;">${{ formatPrecio(saldoContrato) }}</strong>
      </div>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 shadow-sm shrink-0"
        style="background:#c0392b;"
        :disabled="!contratoSel || saldoContrato <= 0"
        @click="modalAbierto = true"
      >
        <i class="pi pi-plus text-sm"></i>
        Registrar pago
      </button>
    </div>

    <!-- Tabla historial -->
    <div
      class="rounded-2xl border shadow-sm overflow-hidden"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <div v-if="pagosStore.loading" class="flex items-center justify-center py-20 gap-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
        <i class="pi pi-spin pi-spinner"></i>
        <span class="text-sm">Cargando pagos...</span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr :style="isDark ? 'background:#111827; border-bottom:1px solid #1f2937;' : 'background:#fafafa; border-bottom:1px solid #f3f4f6;'">
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Fecha</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Contrato</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Cliente</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Monto</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Método</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in pagosStore.pagos"
              :key="p.id"
              class="border-b transition-colors"
              :class="isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-50 hover:bg-gray-50/80'"
            >
              <td class="px-5 py-4 text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-600'">{{ fmt(p.fecha_pago) }}</td>
              <td class="px-5 py-4 font-mono font-bold" style="color:#922b21;">{{ p.contrato?.numero_contrato || '—' }}</td>
              <td class="px-5 py-4">
                <p class="font-semibold" :class="isDark ? 'text-gray-200' : 'text-gray-800'">{{ p.contrato?.cliente?.nombre || '—' }}</p>
              </td>
              <td class="px-5 py-4 font-bold tabular-nums" style="color:#166534;">${{ formatPrecio(p.monto) }}</td>
              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="metodoStyle(p.metodo_pago)">{{ p.metodo_pago }}</span>
              </td>
            </tr>
            <tr v-if="!pagosStore.pagos.length">
              <td colspan="5" class="px-5 py-16 text-center">
                <i class="pi pi-dollar text-4xl mb-3 block" :class="isDark ? 'text-gray-700' : 'text-gray-200'"></i>
                <p class="font-medium" :class="isDark ? 'text-gray-500' : 'text-gray-400'">No hay pagos registrados</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-5 py-3 border-t text-xs" :class="isDark ? 'border-gray-800 text-gray-500' : 'border-gray-50 text-gray-400'">
        {{ pagosStore.pagos.length }} pago{{ pagosStore.pagos.length !== 1 ? 's' : '' }} · Total: ${{ formatPrecio(totalCobrado) }}
      </div>
    </div>

    <PagoRegistrarModal :visible="modalAbierto" :contrato="contratoSel" :guardando="guardando" @cerrar="modalAbierto = false" @guardar="registrarPago" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import PagoRegistrarModal from '@/components/pagos/PagoRegistrarModal.vue'
import { useContratosStore } from '@/stores/contratos'
import { usePagosStore } from '@/stores/pagos'
import { useAppTheme } from '@/composables/useAppTheme'
import { formatPrecio, saldoPendienteContrato, montoExtrasContrato } from '@/utils/contratoFormatters'

const route = useRoute()
const { isDark } = useAppTheme()
const contratosStore = useContratosStore()
const pagosStore = usePagosStore()

const contratoId = ref('')
const contratoSel = ref(null)
const modalAbierto = ref(false)
const guardando = ref(false)

const contratosAbiertos = computed(() =>
  contratosStore.contratos.filter((c) => saldoPendienteContrato(c) > 0 && c.estado_contrato !== 'ANULADO')
)

const saldoContrato = computed(() => saldoPendienteContrato(contratoSel.value))
const montoExtrasSel = computed(() => montoExtrasContrato(contratoSel.value))

function saldoDe(c) {
  return saldoPendienteContrato(c)
}

const totalCobrado = computed(() => pagosStore.pagos.reduce((s, p) => s + Number(p.monto || 0), 0))

onMounted(async () => {
  await contratosStore.fetchContratos()
  pagosStore.fetchPagos()
  if (route.query.contrato_id) {
    contratoId.value = String(route.query.contrato_id)
    await cargarContrato()
    modalAbierto.value = true
  }
})

async function cargarContrato() {
  if (!contratoId.value) { contratoSel.value = null; return }
  contratoSel.value = await contratosStore.fetchContrato(contratoId.value)
}

async function registrarPago(form) {
  guardando.value = true
  try {
    await pagosStore.registrar(contratoSel.value.id, form)
    await cargarContrato()
    pagosStore.fetchPagos()
    modalAbierto.value = false
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Pago registrado', showConfirmButton: false, timer: 2500 })
  } catch (e) {
    Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message, confirmButtonColor: '#922b21' })
  } finally {
    guardando.value = false
  }
}

function fmt(v) {
  if (!v) return '—'
  return new Date(v).toLocaleString('es-SV', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function metodoStyle(m) {
  const map = {
    EFECTIVO: 'background:#dcfce7; color:#166534;',
    TRANSFERENCIA: 'background:#dbeafe; color:#1e40af;',
  }
  return map[m] || 'background:#f3f4f6; color:#6b7280;'
}
</script>
