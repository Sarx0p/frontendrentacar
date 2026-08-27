<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-gray-50'">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">Contratos</h1>
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Contratos de renta activos y finalizados</p>
      </div>
      <router-link
        :to="{ name: 'contratos-nuevo' }"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm no-underline transition-all hover:opacity-90 hover:no-underline active:scale-[0.98] shadow-sm"
        style="background:#c0392b;"
      >
        <i class="pi pi-plus text-sm"></i>
        Nuevo contrato
      </router-link>
    </div>

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
      <select
        v-model="filtroEstado"
        class="px-4 py-2.5 rounded-xl border text-sm focus:outline-none min-w-[160px]"
        :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
      >
        <option value="">Todos los estados</option>
        <option value="ACTIVO">Activo</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="VENCIDO">Vencido</option>
        <option value="FINALIZADO">Finalizado</option>
        <option value="ANULADO">Anulado</option>
      </select>
      <select
        v-model="filtroPago"
        class="px-4 py-2.5 rounded-xl border text-sm focus:outline-none min-w-[160px]"
        :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
      >
        <option value="">Todos los pagos</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="PARCIAL">Pago parcial</option>
        <option value="PAGADO">Pagado</option>
      </select>
    </div>

    <div
      class="rounded-2xl border shadow-sm overflow-hidden"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <div v-if="store.loading" class="flex items-center justify-center py-20 gap-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
        <i class="pi pi-spin pi-spinner"></i>
        <span class="text-sm">Cargando contratos...</span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm min-w-[1040px]">
          <thead>
            <tr :style="isDark ? 'background:#111827; border-bottom:1px solid #1f2937;' : 'background:#fafafa; border-bottom:1px solid #f3f4f6;'">
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Contrato</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Cliente</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Vehículo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Periodo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Total</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Estado</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Pago</th>
              <th class="px-5 py-3.5 min-w-[180px] text-center text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Acciones</th>
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
                <p class="font-semibold" :class="isDark ? 'text-gray-200' : 'text-gray-800'">{{ clienteContrato(c)?.nombre || '-' }}</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ clienteContrato(c)?.dui || '' }}</p>
              </td>
              <td class="px-5 py-4">
                <p class="font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ nombreVehiculo(vehiculoContrato(c)) }}</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ vehiculoContrato(c)?.placa || '' }}</p>
              </td>
              <td class="px-5 py-4" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                <p>{{ fmtFecha(c.fecha_hora_entrega) }}</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">-> {{ fmtFecha(c.fecha_hora_devolucion) }}</p>
              </td>
              <td class="px-5 py-4 tabular-nums" :class="isDark ? 'text-gray-200' : 'text-gray-800'">
                <p class="font-bold">${{ formatPrecio(totalFinalContrato(c)) }}</p>
                <p v-if="montoExtrasContrato(c) > 0" class="text-xs font-semibold mt-0.5" style="color:#d97706;">
                  +${{ formatPrecio(montoExtrasContrato(c)) }} extras
                </p>
                <p v-if="montoPagadoContrato(c) > 0" class="text-xs mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                  Pagado: ${{ formatPrecio(montoPagadoContrato(c)) }}
                </p>
              </td>
              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="estadoContratoStyle(c.estado_contrato)">{{ labelEstadoContrato(c.estado_contrato) }}</span>
              </td>
              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="estadoPagoStyle(c.estado_pago)">{{ labelEstadoPago(c.estado_pago) }}</span>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:shadow-sm shrink-0"
                    :class="isDark ? 'border-red-800 bg-red-950/40 text-[#c0392b] hover:bg-red-950/70' : 'border-red-200 bg-red-50 text-[#c0392b] hover:bg-red-100'"
                    title="Ver contrato"
                    :disabled="cargandoPdf === c.id"
                    @click="verContrato(c)"
                  >
                    <i :class="cargandoPdf === c.id ? 'pi pi-spin pi-spinner' : 'pi pi-eye'" class="text-sm leading-none"></i>
                  </button>
                  <button
                    v-if="c.estado_pago !== 'PAGADO' && c.estado_contrato !== 'ANULADO'"
                    type="button"
                    class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:shadow-sm shrink-0"
                    :class="isDark ? 'border-red-800 bg-red-950/40 text-[#f0a500] hover:bg-red-950/70' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'"
                    title="Registrar pago"
                    :disabled="cargandoPago === c.id"
                    @click="abrirPago(c)"
                  >
                    <i :class="cargandoPago === c.id ? 'pi pi-spin pi-spinner text-xs' : 'pi pi-dollar text-xs'"></i>
                  </button>
                  <router-link
                    v-if="c.estado_contrato === 'ACTIVO'"
                    :to="{ name: 'contrato-cierre', params: { id: c.id } }"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90"
                    style="background:#c0392b;"
                    title="Cerrar renta"
                  >
                    <i class="pi pi-flag text-[10px]"></i>
                    Cerrar
                  </router-link>
                </div>
              </td>
            </tr>
            <tr v-if="!contratosFiltrados.length">
              <td colspan="8" class="px-5 py-16 text-center">
                <i class="pi pi-file-edit text-4xl mb-3 block" :class="isDark ? 'text-gray-700' : 'text-gray-200'"></i>
                <p class="font-medium" :class="isDark ? 'text-gray-500' : 'text-gray-400'">No se encontraron contratos</p>
                <router-link :to="{ name: 'contratos-nuevo' }" class="inline-flex items-center gap-1.5 mt-3 text-sm font-bold" style="color:#c0392b;">
                  <i class="pi pi-plus text-xs"></i> Crear el primer contrato
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-5 py-3 border-t text-xs" :class="isDark ? 'border-gray-800 text-gray-500' : 'border-gray-50 text-gray-400'">
        {{ contratosFiltrados.length }} contrato{{ contratosFiltrados.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <PagoRegistrarModal :visible="modalPago" :contrato="contratoPago" :guardando="guardandoPago" @cerrar="modalPago = false" @guardar="registrarPago" />
    <ContratoPdfPreview :visible="modalPdf" :contrato="contratoVer" @cerrar="cerrarPdf" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import PagoRegistrarModal from '@/components/pagos/PagoRegistrarModal.vue'
import ContratoPdfPreview from '@/components/contratos/ContratoPdfPreview.vue'
import { useContratosStore } from '@/stores/contratos'
import { usePagosStore } from '@/stores/pagos'
import { useAppTheme } from '@/composables/useAppTheme'
import {
  nombreVehiculo,
  formatPrecio,
  formatFechaHora12,
  labelEstadoContrato,
  labelEstadoPago,
  totalFinalContrato,
  montoExtrasContrato,
  montoPagadoContrato,
} from '@/utils/contratoFormatters'

const { isDark } = useAppTheme()
const store = useContratosStore()
const pagosStore = usePagosStore()

const buscar = ref('')
const filtroEstado = ref('')
const filtroPago = ref('')
const modalPago = ref(false)
const contratoPago = ref(null)
const guardandoPago = ref(false)
const cargandoPago = ref(null)
const modalPdf = ref(false)
const contratoVer = ref(null)
const cargandoPdf = ref(null)

const ordenEstadoContrato = {
  ACTIVO: 1,
  VENCIDO: 2,
  PENDIENTE: 3,
  FINALIZADO: 4,
  ANULADO: 5,
}

const ordenPagoContrato = {
  PENDIENTE: 1,
  PARCIAL: 2,
  PAGADO: 3,
}

const contratosFiltrados = computed(() => {
  let list = [...store.contratos]
  const q = buscar.value.trim().toLowerCase()
  if (q) {
    list = list.filter((c) => {
      const cliente = clienteContrato(c)
      const vehiculo = vehiculoContrato(c)
      return c.numero_contrato?.toLowerCase().includes(q) ||
        cliente?.nombre?.toLowerCase().includes(q) ||
        cliente?.dui?.includes(q) ||
        nombreVehiculo(vehiculo).toLowerCase().includes(q) ||
        vehiculo?.placa?.toLowerCase().includes(q)
    })
  }
  if (filtroEstado.value) list = list.filter((c) => c.estado_contrato === filtroEstado.value)
  if (filtroPago.value) list = list.filter((c) => c.estado_pago === filtroPago.value)
  return ordenarContratos(list)
})

onMounted(() => store.fetchContratos())

function clienteContrato(contrato) {
  return contrato?.cliente || contrato?.reserva?.cliente || null
}

function vehiculoContrato(contrato) {
  return contrato?.vehiculo || contrato?.reserva?.vehiculo || null
}

function fechaOrden(contrato) {
  const fechaBase = contrato.estado_contrato === 'FINALIZADO'
    ? contrato.fecha_hora_devolucion
    : contrato.fecha_hora_entrega
  const fecha = new Date(fechaBase || 0).getTime()
  return Number.isNaN(fecha) ? 0 : fecha
}

function ordenarContratos(lista) {
  return lista.sort((a, b) => {
    const estadoA = ordenEstadoContrato[a.estado_contrato] ?? 99
    const estadoB = ordenEstadoContrato[b.estado_contrato] ?? 99
    if (estadoA !== estadoB) return estadoA - estadoB

    if (a.estado_contrato === 'ACTIVO' || a.estado_contrato === 'VENCIDO') {
      const pagoA = ordenPagoContrato[a.estado_pago] ?? 99
      const pagoB = ordenPagoContrato[b.estado_pago] ?? 99
      if (pagoA !== pagoB) return pagoA - pagoB
      return fechaOrden(a) - fechaOrden(b)
    }
    return fechaOrden(b) - fechaOrden(a)
  })
}

function fmtFecha(v) {
  return formatFechaHora12(v)
}

function estadoContratoStyle(estado) {
  const m = {
    ACTIVO: 'background:#fee2e2; color:#991b1b;',
    FINALIZADO: 'background:#dcfce7; color:#166534;',
    VENCIDO: 'background:#fef3c7; color:#92400e;',
    PENDIENTE: 'background:#f3f4f6; color:#6b7280;',
    ANULADO: 'background:#f3f4f6; color:#9ca3af;',
  }
  return m[estado] || 'background:#f3f4f6; color:#6b7280;'
}

function estadoPagoStyle(estado) {
  const m = {
    PENDIENTE: 'background:#fee2e2; color:#991b1b;',
    PARCIAL: 'background:#fef3c7; color:#92400e;',
    PAGADO: 'background:#dcfce7; color:#166534;',
  }
  return m[estado] || 'background:#f3f4f6; color:#6b7280;'
}

function actualizarContratoEnLista(actualizado) {
  const idx = store.contratos.findIndex((x) => x.id === actualizado.id)
  if (idx !== -1) {
    store.contratos[idx] = { ...store.contratos[idx], ...actualizado }
  }
}

async function abrirPago(c) {
  cargandoPago.value = c.id
  try {
    const contrato = await store.fetchContrato(c.id)
    contratoPago.value = await completarContratoConPagos(contrato)
    modalPago.value = true
  } catch (e) {
    Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'No se pudo cargar el contrato.', confirmButtonColor: '#922b21' })
  } finally {
    cargandoPago.value = null
  }
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

async function verContrato(c) {
  cargandoPdf.value = c.id
  try {
    contratoVer.value = await store.fetchContrato(c.id)
    modalPdf.value = true
  } catch (e) {
    Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'No se pudo cargar el contrato.', confirmButtonColor: '#922b21' })
  } finally {
    cargandoPdf.value = null
  }
}

function cerrarPdf() {
  modalPdf.value = false
  contratoVer.value = null
}

async function registrarPago(form) {
  guardandoPago.value = true
  try {
    const pagos = Array.isArray(form.pagos) ? form.pagos : [form]
    for (const pago of pagos) {
      await pagosStore.registrar(contratoPago.value.id, pago)
    }
    const contratoActualizado = await store.fetchContrato(contratoPago.value.id)
    const actualizado = await completarContratoConPagos(contratoActualizado)
    actualizarContratoEnLista(actualizado)
    modalPago.value = false
    contratoPago.value = null
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: pagos.length > 1 ? 'Pagos registrados' : 'Pago registrado',
      showConfirmButton: false,
      timer: 2500,
    })
  } catch (e) {
    Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || pagosStore.error, confirmButtonColor: '#922b21' })
  } finally {
    guardandoPago.value = false
  }
}
</script>
