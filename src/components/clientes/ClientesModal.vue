<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.45);"
        @click.self="$emit('cerrar')"
      >
        <div
          class="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          :class="isDark ? 'modal-panel-dark bg-gray-900' : 'modal-panel-light bg-white'"
          @click.stop
        >

          <div
            class="flex items-center justify-between px-6 py-5"
            :class="isDark ? 'border-b border-gray-800' : 'border-b border-gray-100'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center"
                :class="isDark ? 'bg-red-900/60' : 'bg-red-50'"
              >
                <i class="pi pi-user text-base" :class="isDark ? 'text-[#f0a500]' : ''" :style="!isDark ? 'color:#c0392b;' : ''"></i>
              </div>
              <div>
                <p class="font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">{{ modoEdicion ? 'Editar cliente' : 'Nuevo cliente' }}</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ modoEdicion ? 'Actualiza los datos' : 'Completa la información' }}</p>
              </div>
            </div>
            <button
              @click="$emit('cerrar')"
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border"
              :class="isDark
                ? 'border-red-900/60 text-[#f0a500] hover:bg-red-950/50 hover:border-red-800'
                : 'border-red-100 text-red-500 hover:bg-red-50'"
            >
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>


          <form @submit.prevent="handleGuardar" class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">


            <div>
              <label class="field-label">Nombre completo</label>
              <div class="relative">
                <i class="pi pi-user input-icon"></i>
                <input v-model="form.nombre" type="text" class="field-input" :class="errors.nombre ? 'error' : ''" />
              </div>
              <p v-if="errors.nombre" class="field-error">{{ errors.nombre }}</p>
            </div>


            <div class="flex gap-3">
              <div class="flex-1">
                <label class="field-label">DUI</label>
                <div class="relative">
                  <i class="pi pi-id-card input-icon"></i>
                  <input v-model="form.dui" type="text" placeholder="00000000-0" class="field-input" :class="errors.dui ? 'error' : ''" />
                </div>
                <p v-if="errors.dui" class="field-error">{{ errors.dui }}</p>
              </div>
              <div class="flex-1">
                <label class="field-label">Vencimiento de DUI</label>
                <div class="relative">
                  <i class="pi pi-calendar input-icon"></i>
                  <input v-model="form.nacimiento_dui" type="date" class="field-input" :class="errors.nacimiento_dui ? 'error' : ''" />
                </div>
                <p v-if="errors.nacimiento_dui" class="field-error">{{ errors.nacimiento_dui }}</p>
              </div>
            </div>

            <div class="flex gap-3">
              <div class="flex-1">
                <label class="field-label">Número de licencia</label>
                <div class="relative">
                  <i class="pi pi-car input-icon"></i>
                  <input v-model="form.numero_licencia" type="text" placeholder="X000000000" class="field-input" :class="errors.numero_licencia ? 'error' : ''" />
                </div>
                <p v-if="errors.numero_licencia" class="field-error">{{ errors.numero_licencia }}</p>
              </div>
              <div class="flex-1">
                <label class="field-label">Vencimiento de  licencia</label>
                <div class="relative">
                  <i class="pi pi-calendar input-icon"></i>
                  <input v-model="form.vencimiento_licencia" type="date" class="field-input" :class="errors.vencimiento_licencia ? 'error' : ''" />
                </div>
                <p v-if="errors.vencimiento_licencia" class="field-error">{{ errors.vencimiento_licencia }}</p>
              </div>
            </div>


            <div>
              <label class="field-label">Teléfono</label>
              <div class="relative">
                <i class="pi pi-phone input-icon"></i>
                <input v-model="form.telefono" type="tel" placeholder="0000-0000" class="field-input" :class="errors.telefono ? 'error' : ''" />
              </div>
              <p v-if="errors.telefono" class="field-error">{{ errors.telefono }}</p>
            </div>


            <div class="flex gap-3">
              <div class="flex-1">
                <label class="field-label">Departamento</label>
                <div class="relative">
                  <i class="pi pi-map-marker input-icon"></i>
                  <select
                    v-model="departamentoId"
                    class="field-input"
                    :class="errors.municipio_id ? 'error' : ''"
                    @change="onDepartamentoChange"
                  >
                    <option value="">Seleccionar</option>
                    <option v-for="d in departamentos" :key="d.id" :value="d.id">{{ d.nombre }}</option>
                  </select>
                </div>
              </div>
              <div class="flex-1">
                <label class="field-label">Municipio</label>
                <div class="relative">
                  <i class="pi pi-map input-icon"></i>
                  <select
                    v-model="form.municipio_id"
                    class="field-input"
                    :class="errors.municipio_id ? 'error' : ''"
                    :disabled="!departamentoId || cargandoMunicipios"
                  >
                    <option value="">{{ cargandoMunicipios ? 'Cargando...' : 'Seleccionar' }}</option>
                    <option v-for="m in municipios" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                  </select>
                </div>
                <p v-if="errors.municipio_id" class="field-error">{{ errors.municipio_id }}</p>
              </div>
            </div>


            <div
              v-if="globalError"
              class="flex items-center gap-2 p-3 rounded-xl text-sm border"
              :class="isDark ? 'bg-red-950/40 text-red-300 border-red-900/50' : ''"
              :style="!isDark ? 'background:#fef2f2; color:#c0392b; border-color:#fecaca;' : ''"
            >
              <i class="pi pi-exclamation-circle"></i>{{ globalError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="$emit('cerrar')"
                class="flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all"
                :class="isDark
                  ? 'border-red-800 text-red-300 hover:bg-red-950/40 hover:border-red-700'
                  : 'border-red-200 text-red-600 hover:bg-red-50'"
              >
                Cancelar
              </button>
              <button type="submit" :disabled="loading"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style="background:#c0392b;">
                <i v-if="loading" class="pi pi-spin pi-spinner"></i>
                <i v-else :class="modoEdicion ? 'pi pi-check' : 'pi pi-user-plus'"></i>
                {{ loading ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Registrar cliente' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'
import api from '@/services/api'

const { isDark } = useAppTheme()

const props = defineProps({
  visible:     Boolean,
  modoEdicion: Boolean,
  cliente:     Object,
})

const emit = defineEmits(['guardar', 'cerrar'])

const loading     = ref(false)
const globalError = ref('')

const departamentos = ref([])
const municipios = ref([])
const departamentoId = ref('')
const cargandoMunicipios = ref(false)

const form = reactive({
  id: null, nombre: '', dui: '', nacimiento_dui: '',
  numero_licencia: '', vencimiento_licencia: '',
  telefono: '', municipio_id: '',
})

const errors = reactive({
  nombre: '', dui: '', nacimiento_dui: '',
  numero_licencia: '', vencimiento_licencia: '',
  telefono: '', municipio_id: '',
})

async function cargarDepartamentos() {
  if (departamentos.value.length) return
  try {
    const res = await api.get('/admin/departamentos')
    departamentos.value = res.data.data ?? []
  } catch {
    departamentos.value = []
  }
}

async function cargarMunicipios(depId, municipioSeleccionado = '') {
  municipios.value = []
  if (!depId) return
  cargandoMunicipios.value = true
  try {
    const res = await api.get(`/admin/departamentos/${depId}/municipios`)
    municipios.value = res.data.data ?? []
    if (municipioSeleccionado) form.municipio_id = municipioSeleccionado
  } catch {
    municipios.value = []
  } finally {
    cargandoMunicipios.value = false
  }
}

function onDepartamentoChange() {
  form.municipio_id = ''
  cargarMunicipios(departamentoId.value)
}

watch(() => props.visible, async (val) => {
  if (!val) return
  globalError.value = ''
  Object.keys(errors).forEach(k => errors[k] = '')
  await cargarDepartamentos()

  if (props.modoEdicion && props.cliente) {
    Object.assign(form, {
      id:                   props.cliente.id,
      nombre:               props.cliente.nombre               || '',
      dui:                  props.cliente.dui                  || '',
      nacimiento_dui:       props.cliente.nacimiento_dui       || '',
      numero_licencia:      props.cliente.numero_licencia      || '',
      vencimiento_licencia: props.cliente.vencimiento_licencia || '',
      telefono:             props.cliente.telefono             || '',
      municipio_id:         props.cliente.municipio?.id        || '',
    })
    const depId = props.cliente.municipio?.departamento_id || ''
    departamentoId.value = depId
    if (depId) await cargarMunicipios(depId, form.municipio_id)
  } else {
    Object.assign(form, {
      id: null, nombre: '', dui: '', nacimiento_dui: '',
      numero_licencia: '', vencimiento_licencia: '',
      telefono: '', municipio_id: '',
    })
    departamentoId.value = ''
    municipios.value = []
  }
})

function validar() {
  Object.keys(errors).forEach(k => errors[k] = '')
  let ok = true
  if (!form.nombre)               { errors.nombre               = 'Requerido'; ok = false }
  if (!form.dui)                  { errors.dui                  = 'Requerido'; ok = false }
  if (!form.nacimiento_dui)       { errors.nacimiento_dui       = 'Requerido'; ok = false }
  if (!form.numero_licencia)      { errors.numero_licencia      = 'Requerido'; ok = false }
  if (!form.vencimiento_licencia) { errors.vencimiento_licencia = 'Requerido'; ok = false }
  if (!form.telefono)             { errors.telefono             = 'Requerido'; ok = false }
  if (!form.municipio_id)         { errors.municipio_id         = 'Selecciona departamento y municipio'; ok = false }
  return ok
}

async function handleGuardar() {
  if (!validar()) return
  loading.value     = true
  globalError.value = ''
  try {
    emit('guardar', { ...form })
  } catch {
    globalError.value = 'Ocurrió un error. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:0.375rem; }
.input-icon  { position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); font-size:0.875rem; pointer-events:none; }
.field-input { width:100%; padding:0.75rem 1rem 0.75rem 2.5rem; border-radius:0.75rem; font-size:0.875rem; transition:all 0.15s; outline:none; }
.field-input:focus { border-color:#c0392b; box-shadow:0 0 0 3px rgba(192,57,43,0.1); }
.field-error { font-size:0.7rem; color:#c0392b; margin-top:0.25rem; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.modal-panel-light .field-label { color:#4b5563; }
.modal-panel-light .input-icon { color:#c0392b; opacity:0.65; }
.modal-panel-light .field-input { border:1px solid #e5e7eb; background:#f9fafb; color:#1f2937; }
.modal-panel-light .field-input:focus { background:white; }
.modal-panel-light .field-input.error { border-color:#f87171; background:#fef2f2; }

.modal-panel-dark .field-label { color:#9ca3af; }
.modal-panel-dark .input-icon { color:#f0a500; opacity:0.9; }
.modal-panel-dark .field-input { border:1px solid #4b5563; background:#1f2937; color:#f3f4f6; }
.modal-panel-dark .field-input:focus { background:#111827; }
.modal-panel-dark .field-input.error { border-color:#f87171; background:#450a0a; }
.modal-panel-dark .field-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.85); }
</style>
