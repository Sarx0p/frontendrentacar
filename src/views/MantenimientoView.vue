<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-gray-50'">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">
          Mantenimiento
        </h1>
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          Gestiona los mantenimientos de la flota
        </p>
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
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
    >
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40"></i>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por placa, lugar o descripcion..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none"
          :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white'"
          @keyup.enter="aplicarFiltros"
        />
      </div>
      <select
        v-model="filtroEstado"
        class="px-4 py-2.5 rounded-xl border text-sm min-w-[160px]"
        :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white'"
        @change="aplicarFiltros"
      >
        <option value="">Todos los estados</option>
        <option value="ACTIVO">Activo</option>
        <option value="FINALIZADO">Finalizado</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
      <select
        v-model="filtroTipo"
        class="px-4 py-2.5 rounded-xl border text-sm min-w-[150px]"
        :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white'"
        @change="aplicarFiltros"
      >
        <option value="">Todos los tipos</option>
        <option value="PREVENTIVO">Preventivo</option>
        <option value="CORRECTIVO">Correctivo</option>
      </select>
    </div>

    <div
      class="rounded-2xl border shadow-sm overflow-hidden"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
    >
      <div v-if="store.loading" class="flex items-center justify-center py-20 gap-2 opacity-60">
        <i class="pi pi-spin pi-spinner"></i>
        <span class="text-sm">Cargando mantenimientos...</span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm mantenimiento-table">
          <thead>
            <tr :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'" class="border-b">
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-70">Vehiculo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-70">Tipo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-70">Fecha</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-70">Lugar</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-70">Costo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-70">Estado</th>
              <th class="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-widest opacity-70">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="m in lista"
              :key="m.id"
              class="border-b transition-colors"
              :class="isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'"
            >
              <td class="px-5 py-4">
                <p class="font-semibold" :class="isDark ? 'text-gray-200' : 'text-gray-800'">
                  {{ nombreVehiculo(m.vehiculo) }}
                </p>
                <p class="text-xs opacity-60">{{ m.vehiculo?.placa || '-' }}</p>
              </td>
              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2 py-1 rounded-full" :style="tipoStyle(m.tipo_mantenimiento)">
                  {{ labelTipo(m.tipo_mantenimiento) }}
                </span>
              </td>
              <td class="px-5 py-4 text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                {{ formatFecha(m.fecha) }}
              </td>
              <td class="px-5 py-4" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                {{ m.lugar || '-' }}
              </td>
              <td class="px-5 py-4 font-semibold" :class="isDark ? 'text-[#f0a500]' : 'text-gray-800'">
                ${{ Number(m.costo || 0).toFixed(2) }}
              </td>
              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2 py-1 rounded-full" :style="estadoStyle(m.estado)">
                  {{ labelEstado(m.estado) }}
                </span>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="m.estado === 'ACTIVO'"
                    type="button"
                    class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                    :class="isDark ? 'border-amber-800 bg-amber-950/30 text-amber-300' : 'border-blue-200 bg-blue-50 text-blue-600'"
                    title="Editar mantenimiento"
                    @click="abrirModalEditar(m)"
                  >
                    <i class="pi pi-pencil text-xs"></i>
                  </button>
                  <button
                    v-if="authStore.isAdmin && m.estado === 'ACTIVO'"
                    type="button"
                    class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                    :class="isDark ? 'border-red-800 bg-red-950/40 text-red-300 hover:bg-red-950' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'"
                    title="Anular mantenimiento"
                    @click="confirmarEliminar(m)"
                  >
                    <i class="pi pi-trash text-xs"></i>
                  </button>
                  <span
                    v-if="m.estado !== 'ACTIVO'"
                    :class="isDark ? 'inline-flex w-20 justify-center rounded-full bg-gray-800 px-2 py-1 text-[11px] font-bold text-gray-300' : 'inline-flex w-20 justify-center rounded-full bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-600'"
                    title="Los mantenimientos finalizados o cancelados no se modifican"
                  >
                    Cerrado
                  </span>
                </div>
              </td>
            </tr>
            <tr v-if="!lista.length">
              <td colspan="7" class="px-5 py-16 text-center opacity-50">
                <i class="pi pi-wrench text-4xl mb-3 block"></i>
                No hay mantenimientos registrados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-5 py-3 border-t text-xs opacity-60" :class="isDark ? 'border-gray-800' : 'border-gray-100'">
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

const lista = computed(() => {
  const prioridadEstado = {
    ACTIVO: 1,
    FINALIZADO: 2,
    CANCELADO: 3,
  }

  return [...store.mantenimientos].sort((a, b) => {
    const porEstado = (prioridadEstado[a.estado] || 99) - (prioridadEstado[b.estado] || 99)
    if (porEstado !== 0) return porEstado
    return new Date(b.fecha || 0) - new Date(a.fecha || 0)
  })
})

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
      text: 'El mantenimiento se guardo correctamente.',
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
      title: 'No se pudo guardar',
      text: primerError || e.response?.data?.message || store.error || 'Revisa los datos e intenta de nuevo.',
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
    title: 'Anular mantenimiento',
    text: `El mantenimiento de ${m.vehiculo?.placa || 'este vehiculo'} pasara a cancelado.`,
    showCancelButton: true,
    confirmButtonColor: '#c0392b',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Anular',
    cancelButtonText: 'Cancelar',
    background: isDark.value ? '#1f2937' : '#fff',
    color: isDark.value ? '#f3f4f6' : '#111827',
  })
  if (!result.isConfirmed) return
  try {
    await store.eliminar(m.id)
    await Promise.all([
      aplicarFiltros(),
      vehiculosStore.fetchVehiculos(),
    ])
    await Swal.fire({
      icon: 'success',
      title: 'Mantenimiento anulado',
      confirmButtonColor: '#922b21',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  } catch (e) {
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo anular',
      text: e.response?.data?.message || store.error || 'Intenta de nuevo.',
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
    ACTIVO: 'Activo',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado',
  }
  return map[estado] || estado || '-'
}

function tipoStyle(tipo) {
  return tipo === 'CORRECTIVO'
    ? 'background:#fee2e2;color:#991b1b;'
    : 'background:#dbeafe;color:#1e40af;'
}

function estadoStyle(estado) {
  const styles = {
    ACTIVO: 'background:#fef3c7;color:#92400e;',
    FINALIZADO: 'background:#dcfce7;color:#166534;',
    CANCELADO: 'background:#f3f4f6;color:#6b7280;',
  }
  return styles[estado] || 'background:#f3f4f6;color:#6b7280;'
}
</script>
