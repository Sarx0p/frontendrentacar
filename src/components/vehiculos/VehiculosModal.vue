<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="veh-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        @click.self="$emit('cerrar')"
      >
        <div class="veh-modal-shell w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden" @click.stop>
          <!-- Header -->
          <div class="veh-modal-header flex items-start justify-between gap-3 px-5 py-4 sm:px-6">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0a500]/90">Flota RentaCar</p>
              <h2 class="text-lg sm:text-xl font-extrabold text-white leading-tight">
                {{ modoEdicion ? 'Editar vehículo' : 'Alta de vehículo' }}
              </h2>
            </div>
            <button type="button" class="veh-close-btn" @click="$emit('cerrar')">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="veh-modal-body flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
            <!-- Preview lateral -->
            <aside class="veh-preview hidden md:flex flex-col justify-between p-5 w-[260px] flex-shrink-0">
              <div>
                <div class="veh-plate">
                  <span class="veh-plate-label">El Salvador</span>
                  <span class="veh-plate-num">{{ form.placa.trim().toUpperCase() || 'P-000000' }}</span>
                </div>

                <div class="mt-5 flex items-center gap-3">
                  <div class="veh-preview-icon">
                    <i class="pi pi-car text-xl text-white"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="text-white font-extrabold text-sm truncate">{{ previewNombre }}</p>
                    <p class="text-white/60 text-xs">{{ form.anio || '—' }} · {{ form.color || 'Sin color' }}</p>
                  </div>
                </div>

                <div class="mt-4 flex flex-wrap gap-1.5">
                  <span v-if="previewCategoria" class="veh-chip">{{ previewCategoria }}</span>
                  <span v-if="previewPropietario" class="veh-chip veh-chip--gold">{{ previewPropietario }}</span>
                  <span class="veh-chip" :class="'veh-chip--' + (form.estado || 'DISPONIBLE').replace(/\s/g, '_')">
                    {{ labelEstado(form.estado) }}
                  </span>
                </div>
              </div>

              <div v-if="previewPrecio" class="veh-price-tag">
                <span class="text-[10px] uppercase tracking-wider text-white/70">Tarifa diaria</span>
                <span class="text-2xl font-extrabold text-[#f0a500]">${{ previewPrecio }}</span>
              </div>
            </aside>

            <!-- Formulario -->
            <div class="veh-form-area flex-1 flex flex-col min-h-0" :class="isDark ? 'veh-form-area--dark' : 'veh-form-area--light'">
              <!-- Steps -->
              <div class="flex gap-2 px-5 pt-4 pb-2 flex-shrink-0">
                <button
                  v-for="s in pasos"
                  :key="s.id"
                  type="button"
                  class="veh-step flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                  :class="paso === s.id ? 'veh-step--active' : 'veh-step--idle'"
                  @click="paso = s.id"
                >
                  <i :class="['pi', s.icon, 'text-[11px]']"></i>
                  {{ s.label }}
                </button>
              </div>

              <form class="flex-1 overflow-y-auto px-5 pb-4 space-y-4" @submit.prevent="handleGuardar">
                <!-- Paso 1 -->
                <div v-show="paso === 1" class="space-y-4 animate-fade">
                  <p class="veh-section-title"><i class="pi pi-id-card"></i> Identificación</p>

                  <div class="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-3">
                    <div class="veh-field">
                      <label>Placa</label>
                      <input
                        v-model="form.placa"
                        type="text"
                        class="veh-input veh-input--plate"
                        :class="{ 'veh-input--error': errors.placa }"
                        placeholder="P123456"
                        @input="form.placa = form.placa.toUpperCase()"
                      />
                      <p v-if="errors.placa" class="veh-error">{{ errors.placa }}</p>
                    </div>
                    <div class="veh-field">
                      <label>Año</label>
                      <input
                        v-model="form.anio"
                        type="number"
                        min="1990"
                        :max="anioMax"
                        class="veh-input"
                        :class="{ 'veh-input--error': errors.anio }"
                      />
                      <p v-if="errors.anio" class="veh-error">{{ errors.anio }}</p>
                    </div>
                  </div>

                  <div class="veh-field">
                    <label>Color</label>
                    <div class="flex flex-wrap gap-2 mb-2">
                      <button
                        v-for="c in coloresRapidos"
                        :key="c.nombre"
                        type="button"
                        class="veh-color-btn"
                        :class="{ 'veh-color-btn--active': form.color === c.nombre }"
                        :title="c.nombre"
                        @click="form.color = c.nombre"
                      >
                        <span class="veh-color-dot" :style="{ background: c.hex }"></span>
                        <span class="text-[10px] font-semibold">{{ c.nombre }}</span>
                      </button>
                    </div>
                    <input
                      v-model="form.color"
                      type="text"
                      class="veh-input"
                      :class="{ 'veh-input--error': errors.color }"
                      placeholder="O escribe otro color..."
                    />
                    <p v-if="errors.color" class="veh-error">{{ errors.color }}</p>
                  </div>

                  <p class="veh-section-title mt-2"><i class="pi pi-sitemap"></i> Marca y modelo</p>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="veh-field">
                      <label>Marca</label>
                      <select v-model="marcaId" class="veh-input veh-input--select">
                        <option value="">Seleccionar</option>
                        <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                      </select>
                    </div>
                    <div class="veh-field">
                      <label>Modelo</label>
                      <select
                        v-model="form.modelo_id"
                        class="veh-input veh-input--select"
                        :class="{ 'veh-input--error': errors.modelo_id }"
                        :disabled="!marcaId"
                      >
                        <option value="">Seleccionar</option>
                        <option v-for="m in modelos" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                      </select>
                      <p v-if="errors.modelo_id" class="veh-error">{{ errors.modelo_id }}</p>
                    </div>
                  </div>
                </div>

                <!-- Paso 2 -->
                <div v-show="paso === 2" class="space-y-4 animate-fade">
                  <p class="veh-section-title"><i class="pi pi-tags"></i> Clasificación</p>

                  <div class="veh-field">
                    <label>Categoría</label>
                    <p v-if="modoEdicion" class="veh-cat-hint">
                      <i class="pi pi-lock text-[10px]"></i>
                      La categoría queda fija al registrar el vehículo (ej. Sedán, SUV).
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        v-for="c in categorias"
                        :key="c.id"
                        type="button"
                        class="veh-cat-card"
                        :class="{
                          'veh-cat-card--active': form.categoria_id == c.id,
                          'veh-cat-card--locked': modoEdicion && c.id != categoriaOriginalId,
                        }"
                        :disabled="modoEdicion && c.id != categoriaOriginalId"
                        @click="seleccionarCategoria(c.id)"
                      >
                        <span class="font-bold text-sm flex items-center gap-1.5">
                          <i v-if="modoEdicion && c.id == categoriaOriginalId" class="pi pi-lock text-[10px] opacity-80"></i>
                          {{ c.nombre }}
                        </span>
                        <span class="text-xs opacity-75">${{ Number(c.precio_dia).toFixed(2) }}/día</span>
                      </button>
                    </div>
                    <p v-if="errors.categoria_id" class="veh-error">{{ errors.categoria_id }}</p>
                    <p v-if="!categorias.length" class="text-xs mt-2 opacity-60">No hay categorías. Agrégalas desde el catálogo.</p>
                  </div>

                  <div class="veh-field">
                    <label>Propietario</label>
                    <select
                      v-model="form.propietario_id"
                      class="veh-input veh-input--select"
                      :class="{ 'veh-input--error': errors.propietario_id }"
                    >
                      <option value="">Seleccionar propietario</option>
                      <option v-for="p in propietarios" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                    </select>
                    <p v-if="errors.propietario_id" class="veh-error">{{ errors.propietario_id }}</p>
                  </div>

                  <div class="veh-field">
                    <label>Estado inicial</label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        v-for="e in estadosForm"
                        :key="e.value"
                        type="button"
                        class="veh-estado-btn"
                        :class="{ 'veh-estado-btn--active': form.estado === e.value }"
                        @click="form.estado = e.value"
                      >
                        <span class="veh-estado-check" :class="{ 'veh-estado-check--on': form.estado === e.value }">
                          <i v-if="form.estado === e.value" class="pi pi-check"></i>
                        </span>
                        <span>{{ e.label }}</span>
                      </button>
                    </div>
                    <p v-if="errors.estado" class="veh-error">{{ errors.estado }}</p>
                  </div>
                </div>

                <div v-if="globalError" class="veh-alert">
                  <i class="pi pi-exclamation-circle"></i>{{ globalError }}
                </div>
              </form>

              <!-- Footer -->
              <div class="veh-footer flex-shrink-0 px-5 py-4 flex gap-2 border-t" :class="isDark ? 'border-gray-800' : 'border-gray-100'">
                <button type="button" class="veh-btn veh-btn--ghost flex-1" @click="$emit('cerrar')">
                  Cancelar
                </button>
                <button
                  v-if="paso > 1"
                  type="button"
                  class="veh-btn veh-btn--ghost"
                  @click="paso--"
                >
                  <i class="pi pi-arrow-left"></i>
                </button>
                <button
                  v-if="paso < 2"
                  type="button"
                  class="veh-btn veh-btn--next flex-1"
                  @click="siguientePaso"
                >
                  Siguiente <i class="pi pi-arrow-right ml-1"></i>
                </button>
                <button
                  v-else
                  type="button"
                  class="veh-btn veh-btn--submit flex-1"
                  :disabled="loading || cargandoCatalogos"
                  @click="handleGuardar"
                >
                  <i v-if="loading" class="pi pi-spin pi-spinner"></i>
                  <i v-else :class="modoEdicion ? 'pi pi-check' : 'pi pi-car'"></i>
                  {{ loading ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Ingresar a flota' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import api from '@/services/api'
import { useAppTheme } from '@/composables/useAppTheme'
import { ESTADOS_VEHICULO_NUEVO, ESTADOS_VEHICULO_TODOS, labelEstadoVehiculo } from '@/utils/vehiculoFormatters'

const props = defineProps({
  visible: Boolean,
  modoEdicion: Boolean,
  vehiculo: Object,
})

const emit = defineEmits(['guardar', 'cerrar'])

const { isDark } = useAppTheme()

const paso = ref(1)
const pasos = [
  { id: 1, label: 'Vehículo', icon: 'pi-car' },
  { id: 2, label: 'Clasificación', icon: 'pi-sliders-h' },
]

const coloresRapidos = [
  { nombre: 'Blanco', hex: '#f8fafc' },
  { nombre: 'Negro', hex: '#1f2937' },
  { nombre: 'Gris', hex: '#9ca3af' },
  { nombre: 'Plata', hex: '#cbd5e1' },
  { nombre: 'Rojo', hex: '#dc2626' },
  { nombre: 'Azul', hex: '#2563eb' },
]

const anioMax = new Date().getFullYear() + 1
const loading = ref(false)
const cargandoCatalogos = ref(false)
const globalError = ref('')
const marcaId = ref('')
const marcas = ref([])
const modelos = ref([])
const categorias = ref([])
const propietarios = ref([])
const categoriaOriginalId = ref(null)

const form = reactive({
  id: null,
  placa: '',
  color: '',
  anio: '',
  modelo_id: '',
  categoria_id: '',
  propietario_id: '',
  estado: 'DISPONIBLE',
})

const errors = reactive({
  placa: '',
  color: '',
  anio: '',
  modelo_id: '',
  categoria_id: '',
  propietario_id: '',
  estado: '',
})

const estadosForm = computed(() => (props.modoEdicion ? ESTADOS_VEHICULO_TODOS : ESTADOS_VEHICULO_NUEVO))

const previewNombre = computed(() => {
  const mod = modelos.value.find((m) => m.id == form.modelo_id)
  const mar = marcas.value.find((m) => m.id == marcaId.value)
  if (mod && mar) return `${mar.nombre} ${mod.nombre}`
  if (mod) return mod.nombre
  return 'Vehículo nuevo'
})

const previewCategoria = computed(() => categorias.value.find((c) => c.id == form.categoria_id)?.nombre || '')
const previewPropietario = computed(() => propietarios.value.find((p) => p.id == form.propietario_id)?.nombre || '')
const previewPrecio = computed(() => {
  const c = categorias.value.find((cat) => cat.id == form.categoria_id)
  return c ? Number(c.precio_dia).toFixed(2) : null
})

function labelEstado(e) {
  return labelEstadoVehiculo(e)
}

function seleccionarCategoria(catId) {
  if (props.modoEdicion && catId != categoriaOriginalId.value) return
  form.categoria_id = catId
}

function validarPaso1() {
  errors.placa = errors.color = errors.anio = errors.modelo_id = ''
  let ok = true
  if (!form.placa.trim()) { errors.placa = 'Requerido'; ok = false }
  if (!form.color.trim()) { errors.color = 'Requerido'; ok = false }
  if (!form.anio || Number(form.anio) < 1990) { errors.anio = 'Año inválido'; ok = false }
  if (!form.modelo_id) { errors.modelo_id = 'Selecciona un modelo'; ok = false }
  return ok
}

function validarPaso2() {
  errors.categoria_id = errors.propietario_id = errors.estado = ''
  let ok = true
  if (!form.categoria_id) { errors.categoria_id = 'Selecciona una categoría'; ok = false }
  if (!form.propietario_id) { errors.propietario_id = 'Selecciona un propietario'; ok = false }
  if (!form.estado) { errors.estado = 'Requerido'; ok = false }
  return ok
}

function validar() {
  return validarPaso1() && validarPaso2()
}

function siguientePaso() {
  if (validarPaso1()) paso.value = 2
}

async function cargarCatalogos() {
  cargandoCatalogos.value = true
  try {
    const [marcasRes, catsRes, propsRes] = await Promise.allSettled([
      api.get('/marcas'),
      api.get('/categorias'),
      api.get('/admin/propietarios'),
    ])
    marcas.value = marcasRes.status === 'fulfilled' ? (marcasRes.value.data.data ?? []) : []
    categorias.value = catsRes.status === 'fulfilled' ? (catsRes.value.data.data ?? []) : []
    propietarios.value = propsRes.status === 'fulfilled' ? (propsRes.value.data.data ?? []) : []
  } finally {
    cargandoCatalogos.value = false
  }
}

async function cargarModelos(mId) {
  if (!mId) { modelos.value = []; return }
  try {
    const res = await api.get(`/marcas/${mId}/modelos`)
    modelos.value = res.data.data ?? []
  } catch {
    modelos.value = []
  }
}

watch(marcaId, async (id) => {
  form.modelo_id = ''
  await cargarModelos(id)
})

watch(
  () => props.visible,
  async (val) => {
    if (!val) return
    paso.value = 1
    globalError.value = ''
    Object.keys(errors).forEach((k) => { errors[k] = '' })
    await cargarCatalogos()

    if (props.modoEdicion && props.vehiculo) {
      categoriaOriginalId.value = props.vehiculo.categoria_id || props.vehiculo.categoria?.id || null
      Object.assign(form, {
        id: props.vehiculo.id,
        placa: props.vehiculo.placa || '',
        color: props.vehiculo.color || '',
        anio: props.vehiculo.anio || '',
        modelo_id: props.vehiculo.modelo_id || '',
        categoria_id: props.vehiculo.categoria_id || '',
        propietario_id: props.vehiculo.propietario_id || '',
        estado: props.vehiculo.estado || 'DISPONIBLE',
      })
      marcaId.value = props.vehiculo.modelo?.marca_id || props.vehiculo.modelo?.marca?.id || ''
      if (marcaId.value) await cargarModelos(marcaId.value)
      form.modelo_id = props.vehiculo.modelo_id || ''
    } else {
      categoriaOriginalId.value = null
      marcaId.value = ''
      modelos.value = []
      Object.assign(form, {
        id: null, placa: '', color: '', anio: '', modelo_id: '',
        categoria_id: '', propietario_id: '', estado: 'DISPONIBLE',
      })
    }
  },
)

function handleGuardar() {
  if (!validar()) {
    if (!validarPaso1()) paso.value = 1
    else paso.value = 2
    return
  }
  loading.value = true
  globalError.value = ''
  emit('guardar', {
    id: form.id,
    placa: form.placa.trim(),
    color: form.color.trim(),
    anio: Number(form.anio),
    modelo_id: Number(form.modelo_id),
    categoria_id: Number(form.categoria_id),
    propietario_id: Number(form.propietario_id),
    estado: form.estado,
  })
  loading.value = false
}
</script>

<style scoped>
.veh-modal-backdrop {
  background: rgba(15, 10, 10, 0.55);
  backdrop-filter: blur(4px);
}

.veh-modal-shell {
  border-radius: 1.25rem;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  background: #fff;
}

.veh-modal-header {
  background: linear-gradient(135deg, #922b21 0%, #6b2118 55%, #4a1510 100%);
  border-radius: 1.25rem 1.25rem 0 0;
}

.veh-close-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f0a500;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: background 0.15s;
}
.veh-close-btn:hover { background: rgba(255, 255, 255, 0.2); }

.veh-preview {
  background: linear-gradient(180deg, #1a0a08 0%, #2d1210 100%);
  border-right: 1px solid rgba(240, 165, 0, 0.15);
}

.veh-plate {
  background: linear-gradient(180deg, #fefce8, #fde68a);
  border: 3px solid #1f2937;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.veh-plate-label {
  display: block;
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #374151;
}
.veh-plate-num {
  display: block;
  font-size: 1.35rem;
  font-weight: 900;
  font-family: ui-monospace, monospace;
  letter-spacing: 0.08em;
  color: #111827;
  margin-top: 0.15rem;
}

.veh-preview-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.875rem;
  background: rgba(146, 43, 33, 0.6);
  border: 1px solid rgba(240, 165, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.veh-chip {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.veh-chip--gold { color: #f0a500; border-color: rgba(240, 165, 0, 0.35); }
.veh-chip--DISPONIBLE { background: rgba(22, 101, 52, 0.35); color: #86efac; }

.veh-price-tag {
  padding-top: 1rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.15);
}

.veh-form-area--light { background: #fafafa; }
.veh-form-area--dark { background: #111827; }

.veh-step {
  border: 2px solid transparent;
  cursor: pointer;
}
.veh-step--idle {
  background: rgba(146, 43, 33, 0.06);
  color: #9ca3af;
  border-color: #e5e7eb;
}
.veh-form-area--dark .veh-step--idle {
  background: rgba(255, 255, 255, 0.04);
  border-color: #374151;
  color: #6b7280;
}
.veh-step--active {
  background: #922b21;
  color: #fff;
  border-color: #922b21;
  box-shadow: 0 2px 8px rgba(146, 43, 33, 0.35);
}

.veh-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #922b21;
}
.veh-form-area--dark .veh-section-title { color: #f0a500; }

.veh-field label {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
  color: #6b7280;
}
.veh-form-area--dark .veh-field label { color: #9ca3af; }

.veh-input {
  width: 100%;
  padding: 0.7rem 0.875rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #1f2937;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.veh-form-area--dark .veh-input {
  background: #1f2937;
  border-color: #374151;
  color: #f3f4f6;
}
.veh-input:focus {
  border-color: #922b21;
  box-shadow: 0 0 0 3px rgba(146, 43, 33, 0.12);
}
.veh-input--plate {
  font-family: ui-monospace, monospace;
  font-weight: 800;
  letter-spacing: 0.06em;
  font-size: 1rem;
}
.veh-input--select { cursor: pointer; }
.veh-input--error { border-color: #f87171 !important; }
.veh-input:disabled { opacity: 0.5; cursor: not-allowed; }

.veh-error { font-size: 0.65rem; color: #c0392b; margin-top: 0.25rem; }

.veh-color-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.625rem;
  border: 2px solid #e5e7eb;
  background: #fff;
  transition: all 0.15s;
  min-width: 3.25rem;
}
.veh-form-area--dark .veh-color-btn {
  background: #1f2937;
  border-color: #374151;
  color: #d1d5db;
}
.veh-color-btn--active {
  border-color: #922b21;
  box-shadow: 0 0 0 2px rgba(146, 43, 33, 0.2);
}
.veh-color-dot {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 9999px;
  border: 2px solid rgba(0, 0, 0, 0.12);
}

.veh-cat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.75rem 1rem;
  border-radius: 0.875rem;
  border: 2px solid #e5e7eb;
  background: #fff;
  text-align: left;
  transition: all 0.15s;
  color: #374151;
}
.veh-form-area--dark .veh-cat-card {
  background: #1f2937;
  border-color: #374151;
  color: #e5e7eb;
}
.veh-cat-card--active {
  border-color: #922b21;
  background: #fef2f2;
  box-shadow: 0 0 0 2px rgba(146, 43, 33, 0.15);
}
.veh-form-area--dark .veh-cat-card--active {
  background: rgba(146, 43, 33, 0.25);
}
.veh-cat-card--locked {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
  filter: grayscale(0.35);
}
.veh-cat-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  margin-bottom: 0.5rem;
  color: #922b21;
  font-weight: 600;
}
.veh-form-area--dark .veh-cat-hint { color: #f0a500; }

.veh-estado-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.75rem;
  border: 2px solid #e5e7eb;
  background: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  color: #4b5563;
  transition: all 0.15s;
}
.veh-form-area--dark .veh-estado-btn {
  background: #1f2937;
  border-color: #374151;
  color: #d1d5db;
}
.veh-estado-check {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 9999px;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.55rem;
  transition: all 0.15s;
}
.veh-form-area--dark .veh-estado-check {
  border-color: #4b5563;
}
.veh-estado-check--on {
  background: #f0a500;
  border-color: #f0a500;
  color: #fff;
}
.veh-estado-btn--active {
  border-color: #922b21;
  background: #922b21;
  color: #fff;
}
.veh-estado-btn--active .veh-estado-check {
  background: #f0a500;
  border-color: #f0a500;
  color: #fff;
}

.veh-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.8rem;
  background: #fef2f2;
  color: #c0392b;
  border: 1px solid #fecaca;
}

.veh-footer { background: inherit; }

.veh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.7rem 1rem;
  border-radius: 0.875rem;
  font-size: 0.8rem;
  font-weight: 800;
  transition: all 0.15s;
  border: none;
  cursor: pointer;
}
.veh-btn--ghost {
  background: transparent;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}
.veh-form-area--dark .veh-btn--ghost {
  border-color: #374151;
  color: #9ca3af;
}
.veh-btn--next {
  background: #374151;
  color: #fff;
}
.veh-btn--submit {
  background: linear-gradient(135deg, #c0392b, #922b21);
  color: #fff;
  box-shadow: 0 4px 14px rgba(146, 43, 33, 0.4);
}
.veh-btn--submit:disabled { opacity: 0.55; cursor: not-allowed; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.22s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.animate-fade { animation: fadeIn 0.2s ease; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
