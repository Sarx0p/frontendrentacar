<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-slate-100'">
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
      <div>
        <h1 class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">Catálogo</h1>
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          {{ subtituloActivo }}
        </p>
      </div>

      <div v-if="authStore.isAdmin" class="w-full sm:w-auto flex-shrink-0">
        <button
          type="button"
          @click="accionNuevo"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 shadow-sm"
          style="background:#c0392b;"
        >
          <i class="pi pi-plus text-sm"></i>
          {{ nuevoLabel }}
        </button>
      </div>
    </div>

    <!-- Barra de pestañas -->
    <div
      class="rounded-2xl border shadow-sm p-2 mb-4 overflow-x-auto"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
    >
      <div class="flex gap-1 min-w-max">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          @click="cambiarTab(tab.value)"
          class="catalogo-tab inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all"
          :class="activeTab === tab.value
            ? 'catalogo-tab-active'
            : (isDark ? 'catalogo-tab-inactive-dark' : 'catalogo-tab-inactive-light')"
        >
          <span
            class="tab-icon-wrap w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            :style="estiloIconoTab(tab, activeTab === tab.value)"
          >
            <i :class="tab.icon" class="text-sm" />
          </span>
          <span>{{ tab.label }}</span>
          <span
            class="min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold leading-none inline-flex items-center justify-center"
            :class="activeTab === tab.value
              ? 'bg-white/25 text-white'
              : (isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')"
          >{{ conteoTab(tab.value) }}</span>
        </button>
      </div>
    </div>

    <!-- Buscador y filtros -->
    <div
      class="rounded-2xl border shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
    >
      <div class="relative flex-1">
        <i
          class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
          :class="isDark ? 'text-[#f0a500]' : 'text-gray-400'"
        ></i>
        <input
          v-model="search"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white'"
        />
      </div>
      <select
        v-if="activeTab === 'vehiculos'"
        v-model="filtroEstado"
        class="px-4 py-2.5 rounded-xl border text-sm font-medium min-w-[160px]"
        :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-300 bg-white text-gray-700'"
      >
        <option value="">Todos los estados</option>
        <option v-for="e in estadosFiltro" :key="e.value" :value="e.value">{{ e.label }}</option>
      </select>
    </div>


    <!-- Tabla -->
    <div
      class="rounded-2xl border shadow-sm overflow-hidden"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
    >
      <div v-if="isLoadingTab" class="flex items-center justify-center py-20 gap-2" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
        <i class="pi pi-spin pi-spinner"></i>
        <span class="text-sm">{{ loadingLabel }}</span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm table-fixed catalogo-table" :class="activeTab === 'vehiculos' ? 'min-w-[1160px]' : 'min-w-[860px]'">
          <thead>
            <tr :style="isDark ? 'background:#111827; border-bottom:1px solid #1f2937;' : 'background:#f1f5f9; border-bottom:1px solid #cbd5e1;'">
              <th
                v-for="col in columnasActivas"
                :key="col.key"
                class="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap border-r last:border-r-0"
                :class="isDark ? 'text-gray-400' : 'text-slate-500'"
                :style="{ width: col.width, borderRightColor: isDark ? '#1f2937' : '#e2e8f0' }"
              >
                {{ col.label }}
              </th>
              <th
                v-if="authStore.isAdmin"
                class="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-right whitespace-nowrap"
                :class="isDark ? 'text-gray-400' : 'text-slate-500'"
                style="width: 96px;"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody :key="activeTab">
            <tr
              v-for="(item, index) in itemsFiltrados"
              :key="`${activeTab}-${item.id}-${index}`"
              class="border-b transition-colors"
              :class="isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-slate-50'"
            >
              <td
                v-for="col in columnasActivas"
                :key="`${item.id}-${col.key}`"
                class="px-4 py-4 align-middle border-r last:border-r-0"
                :class="isDark ? 'text-gray-300' : 'text-gray-700'"
                :style="{ width: col.width, borderRightColor: isDark ? '#1f2937' : '#e2e8f0' }"
              >
                <div v-if="col.key === 'vehiculo' && activeTab === 'vehiculos'" class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background:#922b21;">
                    <i class="pi pi-car text-white text-sm"></i>
                  </div>
                  <div>
                    <p class="font-semibold" :class="isDark ? 'text-gray-200' : 'text-gray-800'">{{ nombreVehiculo(item) }}</p>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                      {{ [item.color, item.anio].filter(Boolean).join(' · ') || '—' }}
                    </p>
                  </div>
                </div>
                <div v-else-if="col.key === 'estado' && activeTab === 'vehiculos'" class="estado-picker">
                  <button
                    type="button"
                    class="estado-trigger"
                    :style="estadoVehiculoStyle(item.estado, isDark)"
                    :disabled="estadoActualizandoId === item.id"
                    @click.stop="toggleEstadoMenu(item.id, $event)"
                  >
                    <span>{{ labelEstadoTabla(item.estado) }}</span>
                    <i class="pi pi-chevron-down estado-chevron"></i>
                  </button>
                  <div
                    v-if="estadoMenuAbiertoId === item.id"
                    class="estado-menu"
                    :class="isDark ? 'estado-menu-dark' : 'estado-menu-light'"
                    :style="estadoMenuStyle"
                  >
                    <button
                      v-for="estado in estadosCambioDirecto"
                      :key="estado.value"
                      type="button"
                      class="estado-option"
                      :class="item.estado === estado.value ? 'estado-option-selected' : ''"
                      :style="estadoVehiculoStyle(estado.value, isDark)"
                      @click="cambiarEstadoVehiculo(item, estado.value)"
                    >
                      {{ estado.label }}
                    </button>
                  </div>
                </div>
                <span v-else :class="col.key === 'nombre' || col.key === 'modelo' ? 'font-semibold' : ''">
                  {{ renderCelda(item, col.key) }}
                </span>
              </td>
              <td v-if="authStore.isAdmin" class="px-5 py-4 text-right">
                <div class="inline-flex items-center gap-2">
                  <button
                    type="button"
                    @click="accionEditar(item)"
                    class="w-8 h-8 rounded-lg inline-flex items-center justify-center border transition-all hover:shadow-sm"
                    :class="isDark
                      ? 'border-blue-800 bg-blue-950/40 text-blue-300 hover:bg-blue-950/70 hover:border-blue-700'
                      : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'"
                    :title="`Editar ${tabActiva.label.slice(0, -1).toLowerCase()}`"
                  >
                    <i class="pi pi-pencil text-xs"></i>
                  </button>
                  <button
                    v-if="['categorias', 'propietarios'].includes(activeTab)"
                    type="button"
                    @click="accionEliminar(item)"
                    class="w-8 h-8 rounded-lg inline-flex items-center justify-center border transition-all hover:shadow-sm"
                    :class="isDark
                      ? 'border-red-800 bg-red-950/40 text-red-300 hover:bg-red-950/70 hover:border-red-700'
                      : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'"
                    :title="`Eliminar ${tabActiva.label.slice(0, -1).toLowerCase()}`"
                  >
                    <i class="pi pi-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="itemsFiltrados.length === 0">
              <td :colspan="columnasActivas.length + (authStore.isAdmin ? 1 : 0)" class="px-5 py-16 text-center">
                <i :class="[iconoTabActivo, 'text-4xl mb-3 block', isDark ? 'text-gray-700' : 'text-gray-200']"></i>
                <p class="font-medium" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ emptyLabel }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3 border-t text-xs" :class="isDark ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'">
        Mostrando {{ itemsFiltrados.length }} de {{ conteoTab(activeTab) }} {{ contadorLabel(itemsFiltrados.length) }}
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Swal from 'sweetalert2'
import api from '@/services/api'
import VehiculosModal from '@/components/vehiculos/VehiculosModal.vue'
import VehiculosCatalogoModal from '@/components/vehiculos/VehiculosCatalogoModal.vue'
import { useVehiculosStore } from '@/stores/vehiculos'
import { useAuthStore } from '@/stores/auth'
import { useAppTheme } from '@/composables/useAppTheme'
import {
  nombreVehiculo,
  estadoVehiculoStyle,
  ESTADOS_VEHICULO_TODOS,
} from '@/utils/vehiculoFormatters'

const { isDark } = useAppTheme()
const store = useVehiculosStore()
const authStore = useAuthStore()

const search = ref('')
const filtroEstado = ref('')
const activeTab = ref('vehiculos')
const modalAbierto = ref(false)
const catalogoAbierto = ref(false)
const catalogoTipo = ref('marca')
const modoEdicion = ref(false)
const vehiculoSeleccionado = ref(null)
const modelos = ref([])
const cargandoModelos = ref(false)
const estadoActualizandoId = ref(null)
const estadoMenuAbiertoId = ref(null)
const estadoMenuPos = ref({ top: 0, left: 0, width: 0 })

const estadosFiltro = ESTADOS_VEHICULO_TODOS
const estadosCambioDirecto = ESTADOS_VEHICULO_TODOS
const vehiculos = computed(() => store.vehiculos)
const marcas = computed(() => store.marcas)
const categorias = computed(() => store.categorias)
const propietarios = computed(() => store.propietarios)

const tabs = [
  { value: 'vehiculos', label: 'Vehículos', icon: 'pi pi-car', color: '#c0392b' },
  { value: 'marcas', label: 'Marcas', icon: 'pi pi-bookmark', color: '#f0a500' },
  { value: 'modelos', label: 'Modelos', icon: 'pi pi-sitemap', color: '#7c3aed' },
  { value: 'categorias', label: 'Categorías', icon: 'pi pi-tags', color: '#2563eb' },
  { value: 'propietarios', label: 'Propietarios', icon: 'pi pi-users', color: '#059669' },
]

function estiloIconoTab(tab, activo) {
  if (activo) {
    return {
      background: 'rgba(255,255,255,0.22)',
      color: tab.color === '#c0392b' ? '#f0a500' : tab.color,
    }
  }
  return {
    background: `${tab.color}1f`,
    color: tab.color,
  }
}

const columnasPorTab = {
  vehiculos: [
    { key: 'vehiculo', label: 'Vehículo', width: '255px' },
    { key: 'placa', label: 'Placa', width: '120px' },
    { key: 'capacidad_pasajeros', label: 'Pasajeros', width: '110px' },
    { key: 'categoria_nombre', label: 'Categoría', width: '160px' },
    { key: 'propietario_nombre', label: 'Propietario', width: '230px' },
    { key: 'estado', label: 'Estado', width: '170px' },
  ],
  marcas: [
    { key: 'nombre', label: 'Nombre', width: '58%' },
    { key: 'modelos_count', label: 'Modelos', width: '30%' },
  ],
  categorias: [
    { key: 'nombre', label: 'Nombre', width: '35%' },
    { key: 'descripcion', label: 'Tarifa', width: '35%' },
    { key: 'vehiculos_count', label: 'Vehículos', width: '18%' },
  ],
  modelos: [
    { key: 'modelo', label: 'Modelo', width: '35%' },
    { key: 'marca_nombre', label: 'Marca', width: '35%' },
    { key: 'vehiculos_count', label: 'Vehículos', width: '18%' },
  ],
  propietarios: [
    { key: 'nombre', label: 'Nombre', width: '36%' },
    { key: 'telefono', label: 'Teléfono', width: '18%' },
    { key: 'tipo_propietario', label: 'Tipo', width: '16%' },
    { key: 'vehiculos_count', label: 'Vehículos', width: '18%' },
  ],
}

const subtitulos = {
  vehiculos: 'Gestiona la flota de vehículos',
  marcas: 'Administra las marcas registradas',
  categorias: 'Administra las categorías y tarifas',
  modelos: 'Administra los modelos por marca',
  propietarios: 'Administra los propietarios de la flota',
}

onMounted(() => {
  store.fetchVehiculos()
  store.fetchCatalogos()
  cargarModelos()
  window.addEventListener('click', cerrarMenuEstado)
  window.addEventListener('scroll', cerrarMenuEstado, true)
  window.addEventListener('resize', cerrarMenuEstado)
  window.addEventListener('blur', cerrarMenuEstado)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', cerrarMenuEstado)
  window.removeEventListener('scroll', cerrarMenuEstado, true)
  window.removeEventListener('resize', cerrarMenuEstado)
  window.removeEventListener('blur', cerrarMenuEstado)
})

watch([activeTab, search, filtroEstado], cerrarMenuEstado)

function extraerLista(payload) {
  if (Array.isArray(payload)) return payload
  if (payload?.data && Array.isArray(payload.data)) return payload.data
  return []
}

function esRegistroValido(item, tab) {
  if (!item || item.id == null) return false
  if (tab === 'vehiculos') return Boolean(item.placa?.trim?.() || item.placa)
  return Boolean(String(item.nombre ?? '').trim())
}

function listaTab(tab) {
  const map = {
    vehiculos: extraerLista(vehiculos.value),
    marcas: extraerLista(marcas.value),
    categorias: extraerLista(categorias.value),
    modelos: extraerLista(modelos.value),
    propietarios: extraerLista(propietarios.value),
  }
  return (map[tab] ?? []).filter((item) => esRegistroValido(item, tab))
}

const baseItemsActivos = computed(() => listaTab(activeTab.value))

const columnasActivas = computed(() => columnasPorTab[activeTab.value] ?? columnasPorTab.vehiculos)
const subtituloActivo = computed(() => subtitulos[activeTab.value] ?? subtitulos.vehiculos)
const tabActiva = computed(() => tabs.find((t) => t.value === activeTab.value) ?? tabs[0])
const iconoTabActivo = computed(() => tabActiva.value.icon)

const itemsFiltrados = computed(() => {
  const term = search.value.trim().toLowerCase()
  return baseItemsActivos.value.filter((item) => {
    if (activeTab.value === 'vehiculos' && filtroEstado.value && item.estado !== filtroEstado.value) {
      return false
    }
    if (!term) return true
    return textoBusqueda(item).some((v) => String(v).toLowerCase().includes(term))
  })
})

function conteoTab(tab) {
  return listaTab(tab).length
}

function textoBusqueda(item) {
  if (activeTab.value === 'vehiculos') {
    return [nombreVehiculo(item), item.placa, item.color, item.categoria?.nombre, nombrePropietarioVehiculo(item), item.estado]
  }
  if (activeTab.value === 'marcas') {
    return [item.nombre, String(item.modelos_count ?? '')]
  }
  if (activeTab.value === 'categorias') {
    return [item.nombre, descripcionCategoria(item), String(item.vehiculos_count ?? '')]
  }
  if (activeTab.value === 'modelos') {
    return [item.nombre, item.marca?.nombre, String(item.vehiculos_count ?? '')]
  }
  if (activeTab.value === 'propietarios') {
    return [item.nombre, item.telefono, item.tipo_propietario, String(item.vehiculos_count ?? '')]
  }
  return [item.nombre]
}

const searchPlaceholder = computed(() => {
  const map = {
    vehiculos: 'Buscar por placa, color, marca o modelo...',
    marcas: 'Buscar por nombre de marca...',
    categorias: 'Buscar por nombre o descripción...',
    modelos: 'Buscar por modelo o marca...',
    propietarios: 'Buscar por nombre, teléfono o tipo...',
  }
  return map[activeTab.value]
})

const isLoadingTab = computed(() => {
  if (activeTab.value === 'vehiculos') return store.loading
  if (activeTab.value === 'modelos') return cargandoModelos.value
  return store.catalogosCargando
})

const loadingLabel = computed(() => `Cargando ${tabActiva.value.label.toLowerCase()}...`)
const emptyLabel = computed(() => `No se encontraron ${tabActiva.value.label.toLowerCase()}.`)

const nuevoLabel = computed(() => {
  const map = {
    vehiculos: 'Nuevo Vehículo',
    marcas: 'Nueva Marca',
    categorias: 'Nueva Categoría',
    modelos: 'Nuevo Modelo',
    propietarios: 'Nuevo Propietario',
  }
  return map[activeTab.value]
})

function cambiarTab(tab) {
  cerrarMenuEstado()
  if (activeTab.value === tab) return
  activeTab.value = tab
  search.value = ''
  if (tab !== 'vehiculos') filtroEstado.value = ''
}

function descripcionCategoria(item) {
  if (!item.precio_dia && item.precio_dia !== 0) return 'Sin tarifa definida'
  return `Tarifa diaria: $${Number(item.precio_dia).toFixed(2)}`
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
}

function renderCelda(item, key) {
  const map = {
    placa: item.placa,
    capacidad_pasajeros: item.capacidad_pasajeros,
    categoria_nombre: item.categoria?.nombre,
    propietario_nombre: nombrePropietarioVehiculo(item),
    nombre: item.nombre,
    modelo: item.nombre,
    marca_nombre: item.marca?.nombre,
    modelos_count: item.modelos_count ?? contarModelosPorMarca(item.id),
    vehiculos_count: item.vehiculos_count ?? contarVehiculosRelacionados(item),
    created_at: item.created_at ? formatFecha(item.created_at) : null,
    descripcion: descripcionCategoria(item),
    telefono: item.telefono,
    tipo_propietario: item.tipo_propietario,
  }
  const val = map[key]
  return val === undefined || val === null || val === '' ? '—' : val
}

function nombrePropietarioVehiculo(item) {
  if (item.propietario?.nombre) return item.propietario.nombre
  return propietarios.value.find((p) => p.id == item.propietario_id)?.nombre
}

function contarModelosPorMarca(marcaId) {
  return modelos.value.filter((modelo) => modelo.marca_id == marcaId || modelo.marca?.id == marcaId).length
}

function existePropietarioPropio(exceptId = null) {
  return propietarios.value.some((propietario) => {
    const esPropio = String(propietario.tipo_propietario || '').toUpperCase() === 'PROPIO'
    const esMismo = exceptId != null && propietario.id == exceptId
    return esPropio && !esMismo
  })
}

function contarVehiculosRelacionados(item) {
  const id = item.id
  if (activeTab.value === 'categorias') {
    return vehiculos.value.filter((vehiculo) => vehiculo.categoria_id == id || vehiculo.categoria?.id == id).length
  }
  if (activeTab.value === 'modelos') {
    return vehiculos.value.filter((vehiculo) => vehiculo.modelo_id == id || vehiculo.modelo?.id == id).length
  }
  if (activeTab.value === 'propietarios') {
    return vehiculos.value.filter((vehiculo) => vehiculo.propietario_id == id || vehiculo.propietario?.id == id).length
  }
  return item.vehiculos_count ?? 0
}

function contadorLabel(total) {
  const labels = {
    vehiculos: total === 1 ? 'vehículo' : 'vehículos',
    marcas: total === 1 ? 'marca' : 'marcas',
    categorias: total === 1 ? 'categoría' : 'categorías',
    modelos: total === 1 ? 'modelo' : 'modelos',
    propietarios: total === 1 ? 'propietario' : 'propietarios',
  }
  return labels[activeTab.value] || 'registros'
}

const estadoMenuStyle = computed(() => ({
  top: `${estadoMenuPos.value.top}px`,
  left: `${estadoMenuPos.value.left}px`,
  width: `${estadoMenuPos.value.width}px`,
}))

function toggleEstadoMenu(id, event) {
  if (estadoActualizandoId.value === id) return
  if (estadoMenuAbiertoId.value === id) {
    estadoMenuAbiertoId.value = null
    return
  }

  const rect = event.currentTarget.getBoundingClientRect()
  const menuWidth = Math.max(rect.width, 170)
  const margin = 12
  estadoMenuPos.value = {
    top: rect.bottom + 6,
    left: Math.max(margin, Math.min(rect.left, window.innerWidth - menuWidth - margin)),
    width: menuWidth,
  }
  estadoMenuAbiertoId.value = id
}
function cerrarMenuEstado() {
  if (estadoMenuAbiertoId.value !== null) estadoMenuAbiertoId.value = null
}

function labelEstadoTabla(estado) {
  return estadosCambioDirecto.find((opcion) => opcion.value === estado)?.label || estado || 'Sin estado'
}
function payloadVehiculoConEstado(item, estado) {
  return {
    id: item.id,
    anio: item.anio,
    color: item.color,
    placa: item.placa,
    capacidad_pasajeros: item.capacidad_pasajeros,
    estado,
    propietario_id: item.propietario_id ?? item.propietario?.id,
    categoria_id: item.categoria_id ?? item.categoria?.id,
    modelo_id: item.modelo_id ?? item.modelo?.id,
    observaciones: item.observaciones ?? '',
  }
}

async function cambiarEstadoVehiculo(item, nuevoEstado) {
  if (!nuevoEstado || nuevoEstado === item.estado) return

  estadoActualizandoId.value = item.id
  try {
    await store.actualizar(payloadVehiculoConEstado(item, nuevoEstado))
    estadoMenuAbiertoId.value = null
  } catch (e) {
    estadoMenuAbiertoId.value = null
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo cambiar el estado',
      text: mensajeErrorApi(e, 'El estado no se pudo actualizar con la información actual del vehículo.'),
      confirmButtonColor: '#c0392b',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  } finally {
    estadoActualizandoId.value = null
  }
}
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
  await Promise.all([
    store.fetchCatalogos(true),
    tipo === 'modelo' ? cargarModelos() : Promise.resolve(),
  ])
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

async function accionEditar(item) {
  try {
    if (activeTab.value === 'vehiculos') {
      abrirModalEditar(item)
      return
    }
    if (activeTab.value === 'marcas') {
      const result = await Swal.fire({
        title: 'Editar marca',
        input: 'text',
        inputValue: item.nombre,
        inputLabel: 'Nombre',
        inputPlaceholder: 'Nombre de la marca',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#c0392b',
        background: isDark.value ? '#1f2937' : '#fff',
        color: isDark.value ? '#f3f4f6' : '#111827',
        inputValidator: (value) => (!value?.trim() ? 'El nombre es obligatorio' : null),
      })
      if (!result.isConfirmed) return
      await api.put(`/marcas/${item.id}`, { nombre: result.value.trim() })
      await store.fetchCatalogos(true)
      return
    }
    if (activeTab.value === 'categorias') {
      const { value, isConfirmed } = await Swal.fire({
      title: 'Editar categoría',
      html: `
        <input id="swal-cat-nombre" class="swal2-input" placeholder="Nombre" value="${item.nombre ?? ''}">
        <input id="swal-cat-precio" type="number" min="1" step="0.01" class="swal2-input" placeholder="Precio por día" value="${item.precio_dia ?? ''}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#c0392b',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
      preConfirm: () => {
        const nombre = document.getElementById('swal-cat-nombre')?.value?.trim()
        const precio = Number(document.getElementById('swal-cat-precio')?.value)
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio')
          return false
        }
        if (!precio || Number.isNaN(precio) || precio < 1) {
          Swal.showValidationMessage('El precio debe ser mayor o igual a 1')
          return false
        }
        return { nombre, precio_dia: precio }
      },
    })
      if (!isConfirmed) return
      await api.put(`/categorias/${item.id}`, value)
      await store.fetchCatalogos(true)
      return
    }
    if (activeTab.value === 'modelos') {
      await store.fetchCatalogos()
      const marcasHtml = store.marcas
        .map((m) => `<option value="${m.id}" ${m.id === item.marca_id ? 'selected' : ''}>${m.nombre}</option>`)
        .join('')
      const { value, isConfirmed } = await Swal.fire({
      title: 'Editar modelo',
      html: `
        <input id="swal-mod-nombre" class="swal2-input" placeholder="Nombre" value="${item.nombre ?? ''}">
        <select id="swal-mod-marca" class="swal2-input">${marcasHtml}</select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#c0392b',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
      preConfirm: () => {
        const nombre = document.getElementById('swal-mod-nombre')?.value?.trim()
        const marca_id = Number(document.getElementById('swal-mod-marca')?.value)
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio')
          return false
        }
        if (!marca_id) {
          Swal.showValidationMessage('Selecciona una marca')
          return false
        }
        return { nombre, marca_id }
      },
    })
      if (!isConfirmed) return
      await api.put(`/modelos/${item.id}`, value)
      await cargarModelos()
      return
    }
    if (activeTab.value === 'propietarios') {
      const tipoActual = String(item.tipo_propietario || '').toUpperCase()
      const tipos = existePropietarioPropio(item.id) && tipoActual !== 'PROPIO'
        ? ['TERCERO', 'FAMILIAR']
        : ['PROPIO', 'TERCERO', 'FAMILIAR']
      const tiposHtml = tipos
        .map((t) => `<option value="${t}" ${t === tipoActual ? 'selected' : ''}>${t}</option>`)
        .join('')
      const { value, isConfirmed } = await Swal.fire({
      title: 'Editar propietario',
      html: `
        <input id="swal-prop-nombre" class="swal2-input" placeholder="Nombre" value="${item.nombre ?? ''}">
        <input id="swal-prop-tel" class="swal2-input" placeholder="Teléfono" value="${item.telefono ?? ''}">
        <select id="swal-prop-tipo" class="swal2-input">${tiposHtml}</select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#c0392b',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
      preConfirm: () => {
        const nombre = document.getElementById('swal-prop-nombre')?.value?.trim()
        const telefono = document.getElementById('swal-prop-tel')?.value?.trim()
        const tipo_propietario = document.getElementById('swal-prop-tipo')?.value
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio')
          return false
        }
        if (!telefono) {
          Swal.showValidationMessage('El teléfono es obligatorio')
          return false
        }
        if (!tipo_propietario) {
          Swal.showValidationMessage('Selecciona un tipo')
          return false
        }
        if (tipo_propietario === 'PROPIO' && existePropietarioPropio(item.id)) {
          Swal.showValidationMessage('Ya existe un propietario propio registrado')
          return false
        }
        return { nombre, telefono, tipo_propietario }
      },
    })
      if (!isConfirmed) return
      await api.put(`/admin/propietarios/${item.id}`, value)
      await store.fetchCatalogos(true)
    }
  } catch (e) {
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo guardar',
      text: mensajeErrorApi(e, 'Ocurrió un error al actualizar el registro.'),
      confirmButtonColor: '#c0392b',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  }
}

async function accionEliminar(item) {
  const nombre = activeTab.value === 'vehiculos' ? nombreVehiculo(item) : item.nombre
  const result = await Swal.fire({
    icon: 'warning',
    title: `¿Eliminar ${tabActiva.value.label.slice(0, -1).toLowerCase()}?`,
    text: `Se eliminará ${nombre}. Esta acción no se puede deshacer.`,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#c0392b',
    cancelButtonColor: '#6b7280',
    background: isDark.value ? '#1f2937' : '#fff',
    color: isDark.value ? '#f3f4f6' : '#111827',
  })
  if (!result.isConfirmed) return

  try {
    const endpoints = {
      vehiculos: `/admin/vehiculos/${item.id}`,
      marcas: `/marcas/${item.id}`,
      categorias: `/categorias/${item.id}`,
      modelos: `/modelos/${item.id}`,
      propietarios: `/admin/propietarios/${item.id}`,
    }
    await api.delete(endpoints[activeTab.value])

    if (activeTab.value === 'vehiculos') {
      await store.fetchVehiculos()
    } else if (activeTab.value === 'modelos') {
      await cargarModelos()
    } else {
      await store.fetchCatalogos(true)
    }

    await Swal.fire({
      icon: 'success',
      title: 'Registro eliminado',
      text: 'El registro fue eliminado correctamente.',
      confirmButtonColor: '#c0392b',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  } catch (e) {
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo eliminar',
      text: e.response?.data?.message || 'No fue posible eliminar el registro con la configuración actual.',
      confirmButtonColor: '#c0392b',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  }
}

function mensajeErrorApi(e, fallback) {
  const errors = e.response?.data?.errors
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors).flat().find(Boolean)
    if (first) return String(first)
  }
  return e.response?.data?.message || fallback
}
function accionNuevo() {
  if (activeTab.value === 'vehiculos') {
    abrirModalCrear()
    return
  }
  const map = {
    marcas: 'marca',
    categorias: 'categoria',
    modelos: 'modelo',
    propietarios: 'propietario',
  }
  abrirCatalogo(map[activeTab.value])
}

async function cargarModelos() {
  cargandoModelos.value = true
  try {
    const res = await api.get('/modelos')
    modelos.value = extraerLista(res.data?.data)
  } catch {
    modelos.value = []
  } finally {
    cargandoModelos.value = false
  }
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
.estado-picker {
  position: relative;
  width: 100%;
}
.estado-trigger {
  width: 100%;
  min-height: 2.25rem;
  border-radius: 9999px;
  padding: 0.35rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 800;
  outline: none;
  cursor: pointer;
}
.estado-trigger:disabled {
  cursor: wait;
  opacity: 0.65;
}
.estado-chevron {
  font-size: 0.65rem;
  opacity: 0.7;
}
.estado-menu {
  position: fixed;
  z-index: 9999;
  max-width: calc(100vw - 24px);
  border: 1px solid;
  border-radius: 0.75rem;
  padding: 0.35rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
}
.estado-menu-light {
  background: #fff;
  border-color: #cbd5e1;
}
.estado-menu-dark {
  background: #111827;
  border-color: #374151;
}
.estado-option {
  width: 100%;
  margin-bottom: 0.3rem;
  border-radius: 9999px;
  padding: 0.45rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-align: left;
}
.estado-option:last-child {
  margin-bottom: 0;
}
.estado-option-selected {
  box-shadow: inset 0 0 0 2px currentColor;
}
.catalogo-table {
  border-collapse: separate;
  border-spacing: 0;
}
.catalogo-tab-active {
  background: #922b21;
  color: #fff;
  box-shadow: 0 2px 8px rgba(146, 43, 33, 0.35);
}
.catalogo-tab-inactive-light {
  color: #4b5563;
}
.catalogo-tab-inactive-light:hover {
  background: #f3f4f6;
  color: #111827;
}
.catalogo-tab-inactive-dark {
  color: #9ca3af;
}
.catalogo-tab-inactive-dark:hover {
  background: #1f2937;
  color: #f3f4f6;
}
</style>





