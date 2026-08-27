<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-gray-50'">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">Reservas</h1>
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Gestiona las reservas de vehículos</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all hover:shadow-sm"
          :class="isDark
            ? 'border-red-900/40 bg-red-950/20 text-red-300 hover:bg-red-950/40'
            : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'"
          @click="modalCanceladasAbierto = true"
        >
          <i class="pi pi-history text-sm"></i>
          Cancelaciones
        </button>
        <router-link
          :to="{ name: 'reservas-nueva' }"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm no-underline transition-all hover:opacity-90 hover:no-underline active:scale-[0.98] shadow-sm"
          style="background:#c0392b;"
        >
          <i class="pi pi-plus text-sm"></i>
          Nueva reserva
        </router-link>
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
        <option value="CONCLUIDA">Concluida</option>
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
              <th class="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-center w-[5.5rem]" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Acciones</th>
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

              <td class="px-5 py-4">
                <div class="acciones-piramide">
                  <div class="acciones-piramide__top">
                    <router-link
                      v-if="puedeGenerarContrato(r)"
                      :to="{ name: 'contratos-nuevo', query: { reserva_id: r.id } }"
                      class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:shadow-sm no-underline hover:no-underline"
                      :class="isDark
                        ? 'border-green-900/50 bg-green-950/30 text-green-400 hover:bg-green-950/50'
                        : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'"
                      title="Generar contrato"
                    >
                      <i class="pi pi-file-edit text-xs"></i>
                    </router-link>
                    <button
                      type="button"
                      class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:shadow-sm"
                      :class="[
                        isDark
                          ? 'border-red-800 bg-red-950/40 text-[#f0a500] hover:bg-red-950/70 hover:border-red-700'
                          : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
                        !puedeModificarReserva(r) ? 'opacity-40 cursor-not-allowed' : '',
                      ]"
                      :title="puedeModificarReserva(r) ? 'Editar reserva' : 'Solo las reservas pendientes se pueden editar'"
                      :disabled="!puedeModificarReserva(r)"
                      @click="abrirModalEditar(r)"
                    >
                      <i class="pi pi-pencil text-xs"></i>
                    </button>
                  </div>
                  <button
                    v-if="puedeModificarReserva(r)"
                    type="button"
                    class="acciones-piramide__cancelar"
                    :class="isDark
                      ? 'border-red-900/60 bg-red-950/30 text-red-300 hover:bg-red-950/50'
                      : 'border-red-200 bg-white text-red-600 hover:bg-red-50'"
                    @click="abrirModalCancelar(r)"
                  >
                    Cancelar
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="reservasFiltradas.length === 0">
              <td colspan="8" class="px-5 py-16 text-center">
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

    <ReservaEditarModal
      :visible="modalAbierto"
      :reserva="reservaSeleccionada"
      :guardando="guardandoEdicion"
      @cerrar="cerrarModal"
      @guardar="guardarReserva"
    />

    <ReservaCancelarModal
      :visible="modalCancelarAbierto"
      :reserva="reservaACancelar"
      :guardando="guardandoCancelacion"
      @cerrar="cerrarModalCancelar"
      @confirmar="confirmarCancelacion"
    />

    <ReservasCanceladasModal
      :visible="modalCanceladasAbierto"
      @cerrar="modalCanceladasAbierto = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import ReservaEditarModal from '@/components/reservas/ReservaEditarModal.vue'
import ReservaCancelarModal from '@/components/reservas/ReservaCancelarModal.vue'
import ReservasCanceladasModal from '@/components/reservas/ReservasCanceladasModal.vue'
import { useReservasStore } from '@/stores/reservas'
import { useAppTheme } from '@/composables/useAppTheme'
import { formatFecha } from '@/utils/reservaFormatters'
import { toastSuccess } from '@/utils/toast'

const { isDark } = useAppTheme()
const store = useReservasStore()

const search                  = ref('')
const filtroEstado              = ref('')
const modalAbierto              = ref(false)
const modalCancelarAbierto        = ref(false)
const modalCanceladasAbierto      = ref(false)
const reservaSeleccionada         = ref(null)
const reservaACancelar            = ref(null)
const guardandoEdicion            = ref(false)
const guardandoCancelacion        = ref(false)

const reservas = computed(() => store.reservas)

onMounted(() => aplicarFiltros())

const reservasFiltradas = computed(() =>
  [...reservas.value]
    .filter((r) => r.estado !== 'CANCELADA')
    .sort((a, b) => a.id - b.id)
)

async function aplicarFiltros() {
  const params = {}
  if (filtroEstado.value) params.estado = filtroEstado.value
  if (search.value.trim()) params.search = search.value.trim()
  await store.fetchReservas(params)
}

function abrirModalCancelar(reserva) {
  reservaACancelar.value = reserva
  modalCancelarAbierto.value = true
}

function cerrarModalCancelar() {
  modalCancelarAbierto.value = false
  reservaACancelar.value = null
}

async function confirmarCancelacion(motivo) {
  if (!reservaACancelar.value?.id) return
  guardandoCancelacion.value = true
  try {
    await store.cancelar(reservaACancelar.value.id, motivo)
    await aplicarFiltros()
    toastSuccess('Reserva cancelada')
    cerrarModalCancelar()
  } catch (e) {
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo cancelar',
      text: e.response?.data?.message || store.error || 'Intenta de nuevo.',
      confirmButtonColor: '#922b21',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  } finally {
    guardandoCancelacion.value = false
  }
}

function abrirModalEditar(reserva) {
  reservaSeleccionada.value = { ...reserva }
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  reservaSeleccionada.value = null
}

async function guardarReserva(form) {
  if (!reservaSeleccionada.value?.id) return
  guardandoEdicion.value = true
  try {
    await store.actualizar(reservaSeleccionada.value.id, {
      fecha_inicio: form.fecha_inicio,
      fecha_fin:    form.fecha_fin,
    })
    await aplicarFiltros()
    toastSuccess('Reserva actualizada')
    cerrarModal()
  } catch (e) {
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo actualizar',
      text: e.response?.data?.message || store.error || 'Intenta de nuevo.',
      confirmButtonColor: '#922b21',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  } finally {
    guardandoEdicion.value = false
  }
}

function puedeModificarReserva(reserva) {
  return reserva?.estado === 'PENDIENTE'
}

function puedeGenerarContrato(reserva) {
  return reserva?.estado === 'PENDIENTE' && !reserva?.contrato
}

function nombreVehiculo(v) {
  if (!v) return '—'
  const marca = v.modelo?.marca?.nombre
  const modelo = v.modelo?.nombre
  return [marca, modelo].filter(Boolean).join(' ') || v.placa
}

function formatFechaHora(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-SV', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function labelEstado(estado) {
  const map = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    CANCELADA: 'Cancelada',
    CONCLUIDA: 'Concluida',
  }
  return map[estado] || estado
}

function labelTipo(tipo) {
  const map = { INMEDIATA: 'Renta directa', ANTISIPADA: 'Reserva', ANTICIPADA: 'Reserva' }
  return map[tipo] || 'Reserva'
}

function estadoStyle(estado) {
  const styles = {
    PENDIENTE:  'background:#fef3c7; color:#92400e;',
    CONFIRMADA: 'background:#dcfce7; color:#166534;',
    CANCELADA:  'background:#fee2e2; color:#991b1b;',
    CONCLUIDA:  'background:#dbeafe; color:#1e40af;',
  }
  return styles[estado] || 'background:#f3f4f6; color:#6b7280;'
}

function tipoStyle(tipo) {
  const styles = {
    INMEDIATA:  'background:#dbeafe; color:#1e40af;',
    ANTISIPADA: 'background:#dcfce7; color:#166534;',
    ANTICIPADA: 'background:#dcfce7; color:#166534;',
  }
  return styles[tipo] || styles.ANTISIPADA
}
</script>

<style scoped>
.acciones-piramide {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  min-width: 4.5rem;
}

.acciones-piramide__top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.acciones-piramide__cancelar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.55rem;
  border-radius: 0.5rem;
  border-width: 1px;
  border-style: solid;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: all 0.15s ease;
  white-space: nowrap;
}
</style>
