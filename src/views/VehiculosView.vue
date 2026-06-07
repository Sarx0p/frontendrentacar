<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-gray-50'">
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">Vehículos</h1>
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          Gestiona la flota de vehículos
        </p>
      </div>

      <div v-if="authStore.isAdmin" class="w-full sm:w-auto sm:min-w-[320px] flex flex-col gap-2">
        <p class="text-[10px] font-bold uppercase tracking-widest text-right" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
          Catálogo
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            @click="abrirCatalogo('marca')"
            class="accion-sec flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-xs font-bold transition-all hover:shadow-sm"
            :class="isDark ? 'accion-sec-dark' : 'accion-sec-light'"
          >
            <span class="flex items-center gap-1">
              <i class="pi pi-plus text-[10px]" style="color:#c0392b;"></i>
              <i class="pi pi-bookmark text-sm" style="color:#2563eb;"></i>
            </span>
            <span>Marca</span>
          </button>
          <button
            type="button"
            @click="abrirCatalogo('categoria')"
            class="accion-sec flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-xs font-bold transition-all hover:shadow-sm"
            :class="isDark ? 'accion-sec-dark' : 'accion-sec-light'"
          >
            <span class="flex items-center gap-1">
              <i class="pi pi-plus text-[10px]" style="color:#c0392b;"></i>
              <i class="pi pi-tags text-sm" style="color:#7c3aed;"></i>
            </span>
            <span>Categoría</span>
          </button>
          <button
            type="button"
            @click="abrirCatalogo('modelo')"
            class="accion-sec flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-xs font-bold transition-all hover:shadow-sm"
            :class="isDark ? 'accion-sec-dark' : 'accion-sec-light'"
          >
            <span class="flex items-center gap-1">
              <i class="pi pi-plus text-[10px]" style="color:#c0392b;"></i>
              <i class="pi pi-sitemap text-sm" style="color:#0891b2;"></i>
            </span>
            <span>Modelo</span>
          </button>
          <button
            type="button"
            @click="abrirCatalogo('propietario')"
            class="accion-sec flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-xs font-bold transition-all hover:shadow-sm"
            :class="isDark ? 'accion-sec-dark' : 'accion-sec-light'"
          >
            <span class="flex items-center gap-1">
              <i class="pi pi-plus text-[10px]" style="color:#c0392b;"></i>
              <i class="pi pi-user text-sm" style="color:#16a34a;"></i>
            </span>
            <span>Propietario</span>
          </button>
        </div>
        <button
          type="button"
          @click="abrirModalCrear"
          class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 shadow-sm"
          style="background:#c0392b;"
        >
          <i class="pi pi-plus text-sm"></i>
          Nuevo vehículo
        </button>
      </div>
    </div>

    <div
      class="rounded-2xl border shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <div class="relative flex-1">
        <i
          class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
          :class="isDark ? 'text-[#f0a500]' : 'text-gray-400'"
        ></i>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por placa, color, marca o modelo..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
        />
      </div>
      <select
        v-model="filtroEstado"
        class="px-4 py-2.5 rounded-xl border text-sm font-medium min-w-[160px]"
        :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-200 bg-white text-gray-700'"
      >
        <option value="">Todos los estados</option>
        <option v-for="e in estadosFiltro" :key="e.value" :value="e.value">{{ e.label }}</option>
      </select>
    </div>

    <p
      v-if="store.error"
      class="mb-4 text-sm font-medium rounded-xl border px-4 py-3"
      :class="isDark ? 'text-red-300 bg-red-950/30 border-red-900/50' : 'text-red-700 bg-red-50 border-red-200'"
    >
      <i class="pi pi-exclamation-circle mr-1"></i>{{ store.error }}
    </p>

    <div
      class="rounded-2xl border shadow-sm overflow-hidden"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <div v-if="store.loading" class="flex items-center justify-center py-20 gap-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
        <i class="pi pi-spin pi-spinner"></i>
        <span class="text-sm">Cargando vehículos...</span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr :style="isDark ? 'background:#111827; border-bottom:1px solid #1f2937;' : 'background:#fafafa; border-bottom:1px solid #f3f4f6;'">
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Vehículo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Placa</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Categoría</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Propietario</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Estado</th>
              <th v-if="authStore.isAdmin" class="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="v in vehiculosFiltrados"
              :key="v.id"
              class="border-b transition-colors"
              :class="isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-50 hover:bg-gray-50/80'"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background:#922b21;">
                    <i class="pi pi-car text-white text-sm"></i>
                  </div>
                  <div>
                    <p class="font-semibold" :class="isDark ? 'text-gray-200' : 'text-gray-800'">{{ nombreVehiculo(v) }}</p>
                    <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ v.color }} · {{ v.anio }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 font-mono font-semibold" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ v.placa }}</td>
              <td class="px-5 py-4" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                <p>{{ v.categoria?.nombre || '—' }}</p>
                <p v-if="v.categoria?.precio_dia" class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                  ${{ Number(v.categoria.precio_dia).toFixed(2) }}/día
                </p>
              </td>
              <td class="px-5 py-4" :class="isDark ? 'text-gray-400' : 'text-gray-600'">{{ v.propietario?.nombre || '—' }}</td>
              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="estadoVehiculoStyle(v.estado, isDark)">
                  {{ labelEstadoVehiculo(v.estado) }}
                </span>
              </td>
              <td v-if="authStore.isAdmin" class="px-5 py-4">
                <button
                  type="button"
                  @click="abrirModalEditar(v)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:shadow-sm"
                  :class="isDark
                    ? 'border-red-800 bg-red-950/40 text-[#f0a500] hover:bg-red-950/70 hover:border-red-700'
                    : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'"
                  title="Editar"
                >
                  <i class="pi pi-pencil text-xs"></i>
                </button>
              </td>
            </tr>
            <tr v-if="vehiculosFiltrados.length === 0">
              <td :colspan="authStore.isAdmin ? 6 : 5" class="px-5 py-16 text-center">
                <i class="pi pi-car text-4xl mb-3 block" :class="isDark ? 'text-gray-700' : 'text-gray-200'"></i>
                <p class="font-medium" :class="isDark ? 'text-gray-500' : 'text-gray-400'">No se encontraron vehículos</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3 border-t text-xs" :class="isDark ? 'border-gray-800 text-gray-500' : 'border-gray-50 text-gray-400'">
        {{ vehiculosFiltrados.length }} vehículo{{ vehiculosFiltrados.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <VehiculosModal
      :visible="modalAbierto"
      :modo-edicion="modoEdicion"
      :vehiculo="vehiculoSeleccionado"
      @guardar="guardarVehiculo"
      @cerrar="modalAbierto = false"
    />

    <VehiculosCatalogoModal
      :visible="catalogoAbierto"
      :tipo="catalogoTipo"
      @cerrar="catalogoAbierto = false"
      @guardado="onCatalogoGuardado"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Swal from 'sweetalert2'
import VehiculosModal from '@/components/vehiculos/VehiculosModal.vue'
import VehiculosCatalogoModal from '@/components/vehiculos/VehiculosCatalogoModal.vue'
import { useVehiculosStore } from '@/stores/vehiculos'
import { useAuthStore } from '@/stores/auth'
import { useAppTheme } from '@/composables/useAppTheme'
import {
  nombreVehiculo,
  labelEstadoVehiculo,
  estadoVehiculoStyle,
  ESTADOS_VEHICULO_TODOS,
} from '@/utils/vehiculoFormatters'

const { isDark } = useAppTheme()
const store = useVehiculosStore()
const authStore = useAuthStore()

const search = ref('')
const filtroEstado = ref('')
const modalAbierto = ref(false)
const catalogoAbierto = ref(false)
const catalogoTipo = ref('marca')
const modoEdicion = ref(false)
const vehiculoSeleccionado = ref(null)

const estadosFiltro = ESTADOS_VEHICULO_TODOS
const vehiculos = computed(() => store.vehiculos)

let debounceTimer = null

watch([search, filtroEstado], () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    store.fetchVehiculos({
      search: search.value.trim() || undefined,
      estado: filtroEstado.value || undefined,
    })
  }, 350)
})

onMounted(() => {
  store.fetchVehiculos()
  store.fetchCatalogos()
})

const vehiculosFiltrados = computed(() => vehiculos.value)

function abrirModalCrear() {
  modoEdicion.value = false
  vehiculoSeleccionado.value = null
  modalAbierto.value = true
}

function abrirCatalogo(tipo) {
  catalogoTipo.value = tipo
  catalogoAbierto.value = true
}

async function onCatalogoGuardado({ tipo }) {
  store.invalidarCatalogos(tipo)
  await store.fetchCatalogos(true)
  const labels = {
    marca: 'Marca registrada',
    categoria: 'Categoría registrada',
    modelo: 'Modelo registrado',
    propietario: 'Propietario registrado',
  }
  await Swal.fire({
    icon: 'success',
    title: labels[tipo],
    text: 'El catálogo se actualizó correctamente.',
    confirmButtonColor: '#c0392b',
    background: isDark.value ? '#1f2937' : '#fff',
    color: isDark.value ? '#f3f4f6' : '#111827',
  })
}

function abrirModalEditar(v) {
  modoEdicion.value = true
  vehiculoSeleccionado.value = { ...v }
  modalAbierto.value = true
}

async function guardarVehiculo(form) {
  try {
    if (modoEdicion.value) {
      await store.actualizar(form)
      await Swal.fire({
        icon: 'success',
        title: 'Vehículo actualizado',
        text: 'Los cambios se guardaron correctamente.',
        confirmButtonColor: '#c0392b',
        background: isDark.value ? '#1f2937' : '#fff',
        color: isDark.value ? '#f3f4f6' : '#111827',
      })
    } else {
      await store.crear(form)
      await Swal.fire({
        icon: 'success',
        title: '¡Vehículo registrado!',
        text: 'El vehículo se agregó a la flota.',
        confirmButtonColor: '#c0392b',
        background: isDark.value ? '#1f2937' : '#fff',
        color: isDark.value ? '#f3f4f6' : '#111827',
      })
    }
    modalAbierto.value = false
  } catch (e) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e.response?.data?.message || store.error || 'No se pudo guardar el vehículo.',
      confirmButtonColor: '#c0392b',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  }
}
</script>

<style scoped>
.accion-sec-light {
  border-color: #e5e7eb;
  background: #fff;
  color: #374151;
}
.accion-sec-light:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}
.accion-sec-dark {
  border-color: #374151;
  background: #1f2937;
  color: #d1d5db;
}
.accion-sec-dark:hover {
  border-color: #4b5563;
  background: #111827;
}
</style>
