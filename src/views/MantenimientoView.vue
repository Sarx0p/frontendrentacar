<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-gray-50'">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">Mantenimiento</h1>
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Gestiona los mantenimientos de la flota</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 shadow-sm"
        style="background:#c0392b;"
        @click="abrirModalCrear"
      >
        <i class="pi pi-plus text-sm"></i>
        Nuevo mantenimiento
      </button>
    </div>

    <div
      class="rounded-2xl border shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40"></i>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por placa, proveedor o descripción..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none"
          :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
          @keyup.enter="aplicarFiltros"
        />
      </div>
      <select
        v-model="filtroEstado"
        class="px-4 py-2.5 rounded-xl border text-sm min-w-[160px]"
        :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
        @change="aplicarFiltros"
      >
        <option value="">Todos los estados</option>
        <option value="PROGRAMADO">Programado</option>
        <option value="EN PROCESO">En proceso</option>
        <option value="FINALIZADO">Finalizado</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
      <select
        v-model="filtroTipo"
        class="px-4 py-2.5 rounded-xl border text-sm min-w-[150px]"
        :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
        @change="aplicarFiltros"
      >
        <option value="">Todos los tipos</option>
        <option value="PREVENTIVO">Preventivo</option>
        <option value="CORRECTIVO">Correctivo</option>
      </select>
    </div>

    <div
      class="rounded-2xl border shadow-sm overflow-hidden"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <div v-if="store.loading" class="flex items-center justify-center py-20 gap-2 opacity-60">
        <i class="pi pi-spin pi-spinner"></i>
        <span class="text-sm">Cargando mantenimientos...</span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr :style="isDark ? 'background:#111827; border-bottom:1px solid #1f2937;' : 'background:#fafafa; border-bottom:1px solid #f3f4f6;'">
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-60">Vehículo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-60">Tipo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-60">Periodo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-60">Proveedor</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-60">Costo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-60">Estado</th>
              <th class="px-5 py-3.5 w-24"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="m in lista"
              :key="m.id"
              class="border-b transition-colors"
              :class="isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-50 hover:bg-gray-50/80'"
            >
              <td class="px-5 py-4">
                <p class="font-semibold" :class="isDark ? 'text-gray-200' : 'text-gray-800'">{{ nombreVehiculo(m.vehiculo) }}</p>
                <p class="text-xs opacity-60">{{ m.vehiculo?.placa || '—' }}</p>
              </td>
              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2 py-1 rounded-full" :style="tipoStyle(m.tipo_mantenimiento)">
                  {{ labelTipo(m.tipo_mantenimiento) }}
                </span>
              </td>
              <td class="px-5 py-4 text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                <p>{{ formatFecha(m.fecha_inicio) }}</p>
                <p v-if="m.fecha_fin" class="opacity-60">→ {{ formatFecha(m.fecha_fin) }}</p>
              </td>
              <td class="px-5 py-4" :class="isDark ? 'text-gray-400' : 'text-gray-600'">{{ m.proveedor }}</td>
              <td class="px-5 py-4 font-semibold" :class="isDark ? 'text-[#f0a500]' : 'text-gray-800'">
                ${{ Number(m.costo).toFixed(2) }}
              </td>
              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2 py-1 rounded-full" :style="estadoStyle(m.estado)">
                  {{ labelEstado(m.estado) }}
                </span>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                    :class="isDark ? 'border-red-800 bg-red-950/40 text-[#f0a500]' : 'border-red-200 bg-red-50 text-red-600'"
                    title="Editar"
                    @click="abrirModalEditar(m)"
                  >
                    <i class="pi pi-pencil text-xs"></i>
                  </button>
                  <button
                    v-if="authStore.isAdmin"
                    type="button"
                    class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                    :class="isDark ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
                    title="Eliminar"
                    @click="confirmarEliminar(m)"
                  >
                    <i class="pi pi-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!lista.length">
              <td colspan="7" class="px-5 py-16 text-center opacity-50">
                <i class="pi pi-wrench text-4xl mb-3 block"></i>
                No hay mantenimientos registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-5 py-3 border-t text-xs opacity-50" :class="isDark ? 'border-gray-800' : 'border-gray-50'">
        {{ lista.length }} registro{{ lista.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <MantenimientoModal
      :visible="modalAbierto"
      :modo-edicion="modoEdicion"
      :mantenimiento="seleccionado"
      :vehiculos="vehiculosStore.vehiculos"
      :guardando="guardando"
      @cerrar="cerrarModal"
      @guardar="guardar"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import MantenimientoModal from '@/components/mantenimiento/MantenimientoModal.vue'
import { useMantenimientosStore } from '@/stores/mantenimientos'
import { useVehiculosStore } from '@/stores/vehiculos'
import { useAuthStore } from '@/stores/auth'
import { useAppTheme } from '@/composables/useAppTheme'
import { formatFecha, nombreVehiculo } from '@/utils/reservaFormatters'

const { isDark } = useAppTheme()
const store = useMantenimientosStore()
const vehiculosStore = useVehiculosStore()
const authStore = useAuthStore()

const search = ref('')
const filtroEstado = ref('')
const filtroTipo = ref('')
const modalAbierto = ref(false)
const modoEdicion = ref(false)
const seleccionado = ref(null)
const guardando = ref(false)

const lista = computed(() => store.mantenimientos)

onMounted(async () => {
  await Promise.all([
    aplicarFiltros(),
    vehiculosStore.fetchVehiculos(),
  ])
})

async function aplicarFiltros() {
  const params = {}
  if (search.value.trim()) params.search = search.value.trim()
  if (filtroEstado.value) params.estado = filtroEstado.value
  if (filtroTipo.value) params.tipo_mantenimiento = filtroTipo.value
  await store.fetchMantenimientos(params)
}

function abrirModalCrear() {
  modoEdicion.value = false
  seleccionado.value = null
  modalAbierto.value = true
}

function abrirModalEditar(m) {
  modoEdicion.value = true
  seleccionado.value = m
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  seleccionado.value = null
}

async function guardar(form) {
  guardando.value = true
  try {
    if (modoEdicion.value && seleccionado.value?.id) {
      await store.actualizar(seleccionado.value.id, form)
    } else {
      await store.crear(form)
    }
    await Swal.fire({
      icon: 'success',
      title: modoEdicion.value ? 'Actualizado' : 'Registrado',
      text: 'El mantenimiento se guardó correctamente.',
      confirmButtonColor: '#922b21',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
    cerrarModal()
    await Promise.all([
      aplicarFiltros(),
      vehiculosStore.fetchVehiculos(),
    ])
  } catch (e) {
    const errores = e.response?.data?.errors
    const primerError = errores
      ? Object.values(errores).flat()[0]
      : null
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: primerError || e.response?.data?.message || store.error || 'No se pudo guardar.',
      confirmButtonColor: '#922b21',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  } finally {
    guardando.value = false
  }
}

async function confirmarEliminar(m) {
  const result = await Swal.fire({
    icon: 'warning',
    title: '¿Eliminar mantenimiento?',
    text: `Se eliminará el registro de ${m.vehiculo?.placa || 'este vehículo'}.`,
    showCancelButton: true,
    confirmButtonColor: '#c0392b',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    background: isDark.value ? '#1f2937' : '#fff',
    color: isDark.value ? '#f3f4f6' : '#111827',
  })
  if (!result.isConfirmed) return
  try {
    await store.eliminar(m.id)
    await vehiculosStore.fetchVehiculos()
    await Swal.fire({
      icon: 'success',
      title: 'Eliminado',
      confirmButtonColor: '#922b21',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  } catch (e) {
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo eliminar',
      text: e.response?.data?.message || store.error,
      confirmButtonColor: '#922b21',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  }
}

function labelTipo(tipo) {
  return tipo === 'CORRECTIVO' ? 'Correctivo' : 'Preventivo'
}

function labelEstado(estado) {
  const map = {
    PROGRAMADO: 'Programado',
    'EN PROCESO': 'En proceso',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado',
  }
  return map[estado] || estado
}

function tipoStyle(tipo) {
  return tipo === 'CORRECTIVO'
    ? 'background:#fee2e2;color:#991b1b;'
    : 'background:#dbeafe;color:#1e40af;'
}

function estadoStyle(estado) {
  const styles = {
    PROGRAMADO: 'background:#fef3c7;color:#92400e;',
    'EN PROCESO': 'background:#dbeafe;color:#1e40af;',
    FINALIZADO: 'background:#dcfce7;color:#166534;',
    CANCELADO: 'background:#f3f4f6;color:#6b7280;',
  }
  return styles[estado] || 'background:#f3f4f6;color:#6b7280;'
}
</script>
