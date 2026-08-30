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
            {{ c.numero_contrato }} — {{ nombreCliente(c) }} — {{ saldoLabel(c) }}
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
              v-for="p in pagosPaginados"
              :key="p.id"
              class="border-b transition-colors"
              :class="isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-50 hover:bg-gray-50/80'"
            >
              <td class="px-5 py-4 text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-600'">{{ fmt(p.fecha_pago) }}</td>
              <td class="px-5 py-4 font-mono font-bold" style="color:#922b21;">{{ p.contrato?.numero_contrato || '—' }}</td>
              <td class="px-5 py-4">
                <p class="font-semibold" :class="isDark ? 'text-gray-200' : 'text-gray-800'">{{ nombreClientePago(p) }}</p>
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

      <div class="px-5 py-3 border-t text-xs" :class="isDark ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>
            Mostrando {{ pagination.from }}-{{ pagination.to }} de {{ pagination.total }} pago{{ pagination.total !== 1 ? 's' : '' }}
            · Total: ${{ formatPrecio(totalCobrado) }}
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="pagination-btn"
              :class="isDark ? 'pagination-btn-dark' : 'pagination-btn-light'"
              :disabled="!puedeRetroceder || pagosStore.loading"
              @click="cambiarPagina(paginaActual - 1)"
            >
              <i class="pi pi-chevron-left text-[0.65rem]"></i>
              Anterior
            </button>
            <span class="pagination-page" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
              Página {{ pagination.current_page }} de {{ pagination.last_page }}
            </span>
            <button
              type="button"
              class="pagination-btn"
              :class="isDark ? 'pagination-btn-dark' : 'pagination-btn-light'"
              :disabled="!puedeAvanzar || pagosStore.loading"
              @click="cambiarPagina(paginaActual + 1)"
            >
              Siguiente
              <i class="pi pi-chevron-right text-[0.65rem]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <PagoRegistrarModal :visible="modalAbierto" :contrato="contratoSel" :guardando="guardando" @cerrar="modalAbierto = false" @guardar="registrarPago" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import PagoRegistrarModal from '@/components/pagos/PagoRegistrarModal.vue'
import { useContratosStore } from '@/stores/contratos'
import { usePagosStore } from '@/stores/pagos'
import { useAppTheme } from '@/composables/useAppTheme'
import { toastSuccess } from '@/utils/toast'
import { formatPrecio, saldoPendienteContrato, montoExtrasContrato, totalFinalContrato } from '@/utils/contratoFormatters'

const route = useRoute()
const { isDark } = useAppTheme()
const contratosStore = useContratosStore()
const pagosStore = usePagosStore()

const contratoId = ref('')
const contratoSel = ref(null)
const modalAbierto = ref(false)
const guardando = ref(false)
const paginaActual = ref(1)
const pagosPorPagina = 10

const contratosAbiertos = computed(() =>
  contratosStore.contratos.filter((c) =>
    c.estado_contrato === 'ACTIVO' &&
    c.estado_pago !== 'PAGADO' &&
    saldoPendienteContrato(c) > 0
  )
)

const saldoContrato = computed(() => saldoPendienteContrato(contratoSel.value))
const montoExtrasSel = computed(() => montoExtrasContrato(contratoSel.value))

function saldoDe(c) {
  return saldoPendienteContrato(c)
}

function saldoLabel(c) {
  if (c.saldo_pendiente != null || Array.isArray(c.pagos)) {
    return `Saldo $${formatPrecio(saldoDe(c))}`
  }
  if (c.estado_pago === 'PARCIAL') return 'Saldo pendiente'
  return `Total $${formatPrecio(totalFinalContrato(c))}`
}

const totalCobrado = computed(() => pagosStore.pagos.reduce((s, p) => s + Number(p.monto || 0), 0))

const pagination = computed(() => {
  const total = pagosStore.pagos.length
  const lastPage = Math.max(1, Math.ceil(total / pagosPorPagina))
  const currentPage = Math.min(paginaActual.value, lastPage)
  const from = total ? ((currentPage - 1) * pagosPorPagina) + 1 : 0
  const to = total ? Math.min(currentPage * pagosPorPagina, total) : 0

  return {
    current_page: currentPage,
    last_page: lastPage,
    per_page: pagosPorPagina,
    total,
    from,
    to,
  }
})

const pagosPaginados = computed(() => {
  const start = (pagination.value.current_page - 1) * pagosPorPagina
  return pagosStore.pagos.slice(start, start + pagosPorPagina)
})

const puedeRetroceder = computed(() => pagination.value.current_page > 1)
const puedeAvanzar = computed(() => pagination.value.current_page < pagination.value.last_page)

onMounted(async () => {
  await contratosStore.fetchContratos()
  pagosStore.fetchPagos()
  if (route.query.contrato_id) {
    contratoId.value = String(route.query.contrato_id)
    await cargarContrato()
    modalAbierto.value = true
  }
})

watch(
  () => pagosStore.pagos.length,
  () => {
    if (paginaActual.value > pagination.value.last_page) {
      paginaActual.value = pagination.value.last_page
    }
  },
)

function cambiarPagina(page) {
  if (page < 1 || page > pagination.value.last_page || page === paginaActual.value) return
  paginaActual.value = page
}

async function cargarContrato() {
  if (!contratoId.value) { contratoSel.value = null; return }
  const contrato = await contratosStore.fetchContrato(contratoId.value)
  contratoSel.value = await completarContratoConPagos(contrato)
}

async function completarContratoConPagos(contrato) {
  if (!contrato?.numero_contrato) return contrato
  await pagosStore.fetchPagos({ search: contrato.numero_contrato, per_page: 100 })
  const pagosContrato = pagosStore.pagos.filter((p) => Number(p.contrato_id || p.contrato?.id) === Number(contrato.id))
  return {
    ...contrato,
    pagos: pagosContrato,
    monto_pagado: pagosContrato
      .filter((p) => p.estado_transaccion === 'CONFIRMADO')
      .reduce((s, p) => s + Number(p.monto || 0), 0),
  }
}

async function registrarPago(form) {
  guardando.value = true
  try {
    const pagos = Array.isArray(form.pagos) ? form.pagos : [form]
    for (const pago of pagos) {
      await pagosStore.registrar(contratoSel.value.id, pago)
    }
    await cargarContrato()
    await contratosStore.fetchContratos()
    pagosStore.fetchPagos()
    modalAbierto.value = false
    toastSuccess(pagos.length > 1 ? 'Pagos registrados' : 'Pago registrado')
  } catch (e) {
    Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || pagosStore.error, confirmButtonColor: '#922b21' })
  } finally {
    guardando.value = false
  }
}

function fmt(v) {
  if (!v) return '—'
  return new Date(v).toLocaleString('es-SV', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function nombreCliente(contrato) {
  return contrato?.cliente?.nombre || contrato?.reserva?.cliente?.nombre || 'Cliente no disponible'
}

function nombreClientePago(pago) {
  const contratoCompleto = contratosStore.contratos.find((c) => c.id === pago.contrato_id || c.id === pago.contrato?.id)
  return nombreCliente(contratoCompleto)
}

function metodoStyle(m) {
  const map = {
    EFECTIVO: 'background:#dcfce7; color:#166534;',
    TRANSFERENCIA: 'background:#dbeafe; color:#1e40af;',
    DEPOSITO: 'background:#f3e8ff; color:#6b21a8;',
  }
  return map[m] || 'background:#f3f4f6; color:#6b7280;'
}
</script>

<style scoped>
.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid;
  font-size: 0.75rem;
  font-weight: 800;
  transition: all 0.15s ease;
}

.pagination-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.pagination-btn-light {
  color: #334155;
  background: #ffffff;
  border-color: #dbe3ed;
}

.pagination-btn-light:not(:disabled):hover {
  color: #c0392b;
  background: #fff7f5;
  border-color: #fecaca;
}

.pagination-btn-dark {
  color: #d1d5db;
  background: #111827;
  border-color: #374151;
}

.pagination-btn-dark:not(:disabled):hover {
  color: #f0a500;
  background: #1f2937;
  border-color: #4b5563;
}

.pagination-page {
  min-width: 6.5rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
}
</style>

