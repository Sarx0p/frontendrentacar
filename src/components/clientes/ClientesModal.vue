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
          class="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          :class="isDark ? 'modal-panel-dark bg-gray-900' : 'modal-panel-light bg-white'"
          @click.stop
        >
          <div
            class="flex items-center justify-between px-6 py-5"
            :class="isDark ? 'border-b border-gray-800' : 'border-b border-gray-200'"
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
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-500'">{{ modoEdicion ? 'Actualiza los datos del cliente' : 'Completa la información del cliente' }}</p>
              </div>
            </div>
            <button
              type="button"
              @click="$emit('cerrar')"
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border"
              :class="isDark
                ? 'border-red-900/60 text-[#f0a500] hover:bg-red-950/50 hover:border-red-800'
                : 'border-red-100 text-red-500 hover:bg-red-50'"
            >
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>

          <form @submit.prevent="handleGuardar" class="px-6 py-5 space-y-4 max-h-[72vh] overflow-y-auto">
            <div>
              <label class="field-label">Nombre completo</label>
              <div class="relative">
                <i class="pi pi-user input-icon"></i>
                <input v-model.trim="form.nombre" type="text" class="field-input" :class="errors.nombre ? 'error' : ''" autocomplete="name" />
              </div>
              <p v-if="errors.nombre" class="field-error">{{ errors.nombre }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="field-label">DUI</label>
                <div class="relative">
                  <i class="pi pi-id-card input-icon"></i>
                  <input
                    :value="form.dui"
                    type="text"
                    inputmode="numeric"
                    placeholder="00000000-0"
                    maxlength="10"
                    class="field-input"
                    :class="errors.dui ? 'error' : ''"
                    @input="onDuiInput"
                  />
                </div>
                <p v-if="errors.dui" class="field-error">{{ errors.dui }}</p>
              </div>
              <div>
                <label class="field-label">Vencimiento de DUI</label>
                <div class="relative">
                  <i class="pi pi-calendar input-icon"></i>
                  <input v-model="form.nacimiento_dui" type="date" class="field-input" :class="errors.nacimiento_dui ? 'error' : ''" />
                </div>
                <p v-if="errors.nacimiento_dui" class="field-error">{{ errors.nacimiento_dui }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="field-label">Número de licencia</label>
                <div class="relative">
                  <i class="pi pi-car input-icon"></i>
                  <input v-model.trim="form.numero_licencia" type="text" placeholder="X000000000" class="field-input" :class="errors.numero_licencia ? 'error' : ''" />
                </div>
                <p v-if="errors.numero_licencia" class="field-error">{{ errors.numero_licencia }}</p>
              </div>
              <div>
                <label class="field-label">Vencimiento de licencia</label>
                <div class="relative">
                  <i class="pi pi-calendar input-icon"></i>
                  <input v-model="form.vencimiento_licencia" type="date" class="field-input" :class="errors.vencimiento_licencia ? 'error' : ''" />
                </div>
                <p v-if="errors.vencimiento_licencia" class="field-error">{{ errors.vencimiento_licencia }}</p>
              </div>
            </div>

            <div>
              <label class="field-label">Teléfono</label>
              <div class="grid grid-cols-1 sm:grid-cols-[9.5rem_1fr] gap-2">
                <div class="country-picker">
                  <button
                    type="button"
                    class="country-trigger field-input"
                    :class="errors.telefono ? 'error' : ''"
                    @click="countryMenuOpen = !countryMenuOpen"
                  >
                    <span class="country-flag" :class="paisTelefono.flagClass"></span>
                    <span class="country-code">{{ paisTelefono.codigo }}</span>
                    <span class="country-prefix">{{ paisTelefono.prefijo }}</span>
                    <i class="pi pi-chevron-down country-chevron"></i>
                  </button>
                  <div v-if="countryMenuOpen" class="country-menu" :class="isDark ? 'country-menu-dark' : 'country-menu-light'">
                    <button
                      v-for="pais in paisesTelefono"
                      :key="pais.codigo"
                      type="button"
                      class="country-option"
                      :class="form.pais_telefono === pais.codigo ? 'country-option-active' : ''"
                      @click="seleccionarPais(pais.codigo)"
                    >
                      <span class="country-flag" :class="pais.flagClass"></span>
                      <span class="country-code">{{ pais.codigo }}</span>
                      <span class="country-prefix">{{ pais.prefijo }}</span>
                    </button>
                  </div>
                </div>
                <input
                  :value="form.telefono"
                  type="tel"
                  inputmode="numeric"
                  :placeholder="paisTelefono.placeholder"
                  class="field-input"
                  :class="errors.telefono ? 'error' : ''"
                  @input="onTelefonoInput"
                  @paste.prevent="onTelefonoPaste"
                />
              </div>
              <p v-if="errors.telefono" class="field-error">{{ errors.telefono }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="field-label">Departamento</label>
                <div class="relative">
                  <i class="pi pi-map-marker input-icon"></i>
                  <select
                    v-model="form.departamento_id"
                    class="field-input field-select"
                    :class="errors.departamento_id ? 'error' : ''"
                    :disabled="cargandoDepartamentos"
                  >
                    <option value="">{{ cargandoDepartamentos ? 'Cargando...' : 'Selecciona departamento' }}</option>
                    <option v-for="departamento in departamentos" :key="departamento.id" :value="String(departamento.id)">
                      {{ departamento.nombre }}
                    </option>
                  </select>
                </div>
                <p v-if="errors.departamento_id" class="field-error">{{ errors.departamento_id }}</p>
              </div>
              <div>
                <label class="field-label">Municipio</label>
                <div class="relative">
                  <i class="pi pi-map input-icon"></i>
                  <select
                    v-model="form.municipio_id"
                    class="field-input field-select"
                    :class="errors.municipio_id ? 'error' : ''"
                    :disabled="!form.departamento_id || cargandoMunicipios"
                  >
                    <option value="">{{ municipioPlaceholder }}</option>
                    <option v-for="municipio in municipios" :key="municipio.id" :value="String(municipio.id)">
                      {{ municipio.nombre }}
                    </option>
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
              <button
                type="submit"
                :disabled="guardando || cargandoDepartamentos || cargandoMunicipios"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style="background:#c0392b;"
              >
                <i v-if="guardando" class="pi pi-spin pi-spinner"></i>
                <i v-else :class="modoEdicion ? 'pi pi-check' : 'pi pi-user-plus'"></i>
                {{ guardando ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Registrar cliente' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'
import { useClientesStore } from '@/stores/clientes'

const { isDark } = useAppTheme()
const store = useClientesStore()

const props = defineProps({
  visible: Boolean,
  modoEdicion: Boolean,
  cliente: Object,
  guardando: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
  submitError: { type: String, default: '' },
})

const emit = defineEmits(['guardar', 'cerrar'])

const globalError = ref('')
const departamentos = ref([])
const municipios = ref([])
const cargandoDepartamentos = ref(false)
const cargandoMunicipios = ref(false)
const countryMenuOpen = ref(false)

const form = reactive({
  id: null,
  nombre: '',
  dui: '',
  nacimiento_dui: '',
  numero_licencia: '',
  vencimiento_licencia: '',
  telefono: '',
  pais_telefono: 'SV',
  departamento_id: '',
  municipio_id: '',
})

const errors = reactive({
  nombre: '',
  dui: '',
  nacimiento_dui: '',
  numero_licencia: '',
  vencimiento_licencia: '',
  telefono: '',
  departamento_id: '',
  municipio_id: '',
})

const paisesTelefono = [
  { codigo: 'SV', flagClass: 'flag-sv', prefijo: '+503', digitos: 8, grupos: [4, 4], placeholder: '0000-0000' },
  { codigo: 'GT', flagClass: 'flag-gt', prefijo: '+502', digitos: 8, grupos: [4, 4], placeholder: '0000-0000' },
  { codigo: 'HN', flagClass: 'flag-hn', prefijo: '+504', digitos: 8, grupos: [4, 4], placeholder: '0000-0000' },
  { codigo: 'NI', flagClass: 'flag-ni', prefijo: '+505', digitos: 8, grupos: [4, 4], placeholder: '0000-0000' },
  { codigo: 'CR', flagClass: 'flag-cr', prefijo: '+506', digitos: 8, grupos: [4, 4], placeholder: '0000-0000' },
  { codigo: 'PA', flagClass: 'flag-pa', prefijo: '+507', digitos: 8, grupos: [4, 4], placeholder: '0000-0000' },
  { codigo: 'MX', flagClass: 'flag-mx', prefijo: '+52', digitos: 10, grupos: [2, 4, 4], placeholder: '00-0000-0000' },
  { codigo: 'US', flagClass: 'flag-us', prefijo: '+1', digitos: 10, grupos: [3, 3, 4], placeholder: '000-000-0000' },
]

const paisTelefono = computed(() => paisesTelefono.find((pais) => pais.codigo === form.pais_telefono) || paisesTelefono[0])

const municipioPlaceholder = computed(() => {
  if (!form.departamento_id) return 'Selecciona primero un departamento'
  if (cargandoMunicipios.value) return 'Cargando...'
  return 'Selecciona municipio'
})

watch(() => props.visible, async (val) => {
  if (!val) return
  resetErrors()
  llenarFormulario()
  await cargarDepartamentos()
  if (form.departamento_id) await cargarMunicipios(form.departamento_id, false)
})

watch(() => form.departamento_id, async (departamentoId, previo) => {
  if (!props.visible || departamentoId === previo) return
  form.municipio_id = ''
  municipios.value = []
  await cargarMunicipios(departamentoId, true)
})

watch(() => props.serverErrors, (serverErrors) => {
  aplicarErroresServidor(serverErrors)
}, { deep: true })

watch(() => props.submitError, (message) => {
  globalError.value = message || ''
})

function resetErrors() {
  globalError.value = ''
  Object.keys(errors).forEach(k => errors[k] = '')
}

function llenarFormulario() {
  const cliente = props.cliente || {}
  const municipio = cliente.municipio || {}

  if (props.modoEdicion && props.cliente) {
    Object.assign(form, {
      id: cliente.id,
      nombre: cliente.nombre || '',
      dui: cliente.dui || '',
      nacimiento_dui: fechaInput(cliente.nacimiento_dui),
      numero_licencia: cliente.numero_licencia || '',
      vencimiento_licencia: fechaInput(cliente.vencimiento_licencia),
      telefono: telefonoLocalDesdeGuardado(cliente.telefono || ''),
      pais_telefono: paisDesdeTelefonoGuardado(cliente.telefono || ''),
      departamento_id: String(cliente.departamento_id ?? municipio.departamento_id ?? municipio.departamento?.id ?? ''),
      municipio_id: String(cliente.municipio_id ?? municipio.id ?? ''),
    })
    return
  }

  Object.assign(form, {
    id: null,
    nombre: '',
    dui: '',
    nacimiento_dui: '',
    numero_licencia: '',
    vencimiento_licencia: '',
    telefono: '',
    pais_telefono: 'SV',
    departamento_id: '',
    municipio_id: '',
  })
  municipios.value = []
}

async function cargarDepartamentos() {
  cargandoDepartamentos.value = true
  try {
    departamentos.value = await store.fetchDepartamentos()
  } catch {
    globalError.value = 'No se pudieron cargar los departamentos.'
  } finally {
    cargandoDepartamentos.value = false
  }
}

async function cargarMunicipios(departamentoId) {
  if (!departamentoId) return
  cargandoMunicipios.value = true
  try {
    municipios.value = await store.fetchMunicipios(departamentoId)
  } catch {
    globalError.value = 'No se pudieron cargar los municipios.'
  } finally {
    cargandoMunicipios.value = false
  }
}

function validar() {
  resetErrors()
  let ok = true
  if (!form.nombre) { errors.nombre = 'El nombre es obligatorio.'; ok = false }
  if (!form.dui) {
    errors.dui = 'El DUI es obligatorio.'
    ok = false
  } else if (!duiTieneFormato(form.dui)) {
    errors.dui = 'El DUI debe tener el formato 12345678-9.'
    ok = false
  } else if (!duiValido(form.dui)) {
    errors.dui = 'El DUI no es valido. Revisa el digito final.'
    ok = false
  }
  if (!form.nacimiento_dui) { errors.nacimiento_dui = 'La fecha del DUI es obligatoria.'; ok = false }
  if (!form.numero_licencia) { errors.numero_licencia = 'El número de licencia es obligatorio.'; ok = false }
  if (!form.vencimiento_licencia) { errors.vencimiento_licencia = 'La fecha de vencimiento de la licencia es obligatoria.'; ok = false }
  const telefonoLocal = telefonoLocalNormalizado(form.telefono)
  if (!telefonoLocal) {
    errors.telefono = 'El teléfono es obligatorio.'
    ok = false
  } else if (telefonoLocal.length !== paisTelefono.value.digitos) {
    errors.telefono = `Debe tener ${paisTelefono.value.digitos} dígitos para ${paisTelefono.value.prefijo}.`
    ok = false
  }
  if (!form.departamento_id) { errors.departamento_id = 'Selecciona un departamento.'; ok = false }
  if (!form.municipio_id) { errors.municipio_id = 'Selecciona un municipio.'; ok = false }
  return ok
}

function handleGuardar() {
  if (!validar()) return
  emit('guardar', {
    id: form.id,
    nombre: form.nombre.trim(),
    dui: form.dui.trim(),
    nacimiento_dui: form.nacimiento_dui,
    numero_licencia: form.numero_licencia.trim(),
    vencimiento_licencia: form.vencimiento_licencia,
    telefono: telefonoNormalizadoCompleto(),
    municipio_id: form.municipio_id,
  })
}

function aplicarErroresServidor(serverErrors = {}) {
  Object.keys(errors).forEach(k => errors[k] = '')
  Object.entries(serverErrors || {}).forEach(([field, messages]) => {
    if (field in errors) errors[field] = Array.isArray(messages) ? messages[0] : messages
  })
}

function onDuiInput(event) {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 9)
  form.dui = digits.length > 8 ? `${digits.slice(0, 8)}-${digits.slice(8)}` : digits
}

function duiTieneFormato(value) {
  return /^\d{8}-\d$/.test(value)
}

function duiValido(value) {
  if (!duiTieneFormato(value)) return false
  const digits = value.replace('-', '').split('').map(Number)
  const factores = [9, 8, 7, 6, 5, 4, 3, 2]
  const suma = factores.reduce((total, factor, index) => total + digits[index] * factor, 0)
  const residuo = suma % 10
  const verificador = (10 - residuo) % 10
  return digits[8] === verificador
}

function soloDigitos(value) {
  return String(value || '').replace(/\D/g, '')
}

function quitarPrefijoPais(digitos, pais = paisTelefono.value) {
  const prefijo = soloDigitos(pais.prefijo)
  return digitos.startsWith(prefijo) ? digitos.slice(prefijo.length) : digitos
}

function formatearTelefono(digitos, pais = paisTelefono.value) {
  const local = quitarPrefijoPais(soloDigitos(digitos), pais).slice(0, pais.digitos)
  const partes = []
  let index = 0
  pais.grupos.forEach((size) => {
    const parte = local.slice(index, index + size)
    if (parte) partes.push(parte)
    index += size
  })
  return partes.join('-')
}

function telefonoNormalizadoCompleto() {
  return `${paisTelefono.value.prefijo} ${form.telefono}`
}

function telefonoLocalNormalizado(value, pais = paisTelefono.value) {
  return quitarPrefijoPais(soloDigitos(value), pais)
}

function paisDesdeTelefonoGuardado(value) {
  const digitos = soloDigitos(value)
  return paisesTelefono.find((pais) => digitos.startsWith(soloDigitos(pais.prefijo)))?.codigo || 'SV'
}

function telefonoLocalDesdeGuardado(value) {
  const pais = paisesTelefono.find((item) => item.codigo === paisDesdeTelefonoGuardado(value)) || paisesTelefono[0]
  return formatearTelefono(value, pais)
}

function seleccionarPais(codigo) {
  const paisAnterior = paisTelefono.value
  const siguientePais = paisesTelefono.find((pais) => pais.codigo === codigo) || paisTelefono.value
  const digitosActuales = telefonoLocalNormalizado(form.telefono, paisAnterior)
  form.pais_telefono = siguientePais.codigo
  form.telefono = formatearTelefono(digitosActuales, siguientePais)
  countryMenuOpen.value = false
}

function onTelefonoInput(event) {
  form.telefono = formatearTelefono(event.target.value)
}

function onTelefonoPaste(event) {
  form.telefono = formatearTelefono(event.clipboardData?.getData('text') || '')
}

function fechaInput(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}
</script>

<style scoped>
.field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:0.375rem; }
.input-icon  { position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); font-size:0.875rem; pointer-events:none; }
.field-input { width:100%; padding:0.75rem 1rem 0.75rem 2.5rem; border-radius:0.75rem; font-size:0.875rem; transition:all 0.15s; outline:none; }
.field-select { appearance:auto; padding-right:0.875rem; }
.country-picker { position:relative; }
.country-trigger { min-height:2.75rem; padding:0.72rem 0.65rem; display:flex; align-items:center; gap:0.35rem; }
.country-flag { width:1.25rem; height:0.85rem; border-radius:0.16rem; flex-shrink:0; box-shadow:inset 0 0 0 1px rgba(15,23,42,0.14); background:#e5e7eb; }
.flag-sv, .flag-hn, .flag-ni { background:linear-gradient(to bottom,#2563eb 0 33%,#fff 33% 66%,#2563eb 66%); }
.flag-gt { background:linear-gradient(to right,#38bdf8 0 33%,#fff 33% 66%,#38bdf8 66%); }
.flag-cr { background:linear-gradient(to bottom,#1d4ed8 0 18%,#fff 18% 34%,#dc2626 34% 66%,#fff 66% 82%,#1d4ed8 82%); }
.flag-pa { background:linear-gradient(135deg,#fff 0 25%,#dc2626 25% 50%,#fff 50% 75%,#2563eb 75%); }
.flag-mx { background:linear-gradient(to right,#16a34a 0 33%,#fff 33% 66%,#dc2626 66%); }
.flag-us { background:repeating-linear-gradient(to bottom,#dc2626 0 0.12rem,#fff 0.12rem 0.24rem); position:relative; }
.flag-us::before { content:''; position:absolute; left:0; top:0; width:45%; height:48%; background:#1d4ed8; border-radius:0.16rem 0 0 0; }
.country-code { font-weight:700; }
.country-prefix { color:#475569; }
.country-chevron { margin-left:auto; font-size:0.65rem; color:#94a3b8; }
.country-menu { position:absolute; z-index:60; left:0; right:0; top:calc(100% + 0.35rem); border:1px solid; border-radius:0.75rem; overflow:hidden; box-shadow:0 12px 24px rgba(15,23,42,0.18); }
.country-menu-light { background:#fff; border-color:#cbd5e1; }
.country-menu-dark { background:#111827; border-color:#374151; }
.country-option { width:100%; min-height:2.25rem; padding:0.45rem 0.7rem; display:flex; align-items:center; gap:0.45rem; font-size:0.875rem; text-align:left; }
.country-option:hover, .country-option-active { background:#eef2ff; color:#1d4ed8; }
.country-menu-dark .country-option:hover, .country-menu-dark .country-option-active { background:#1f2937; color:#f0a500; }
.field-input:focus { border-color:#c0392b; box-shadow:0 0 0 3px rgba(192,57,43,0.1); }
.field-input:disabled { opacity:0.7; cursor:not-allowed; }
.field-error { font-size:0.7rem; color:#c0392b; margin-top:0.25rem; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.modal-panel-light .field-label { color:#4b5563; }
.modal-panel-light .input-icon { color:#c0392b; opacity:0.65; }
.modal-panel-light .field-input { border:1px solid #d1d5db; background:#f9fafb; color:#1f2937; }
.modal-panel-light .field-input:focus { background:white; }
.modal-panel-light .field-input.error { border-color:#f87171; background:#fef2f2; }

.modal-panel-dark .field-label { color:#9ca3af; }
.modal-panel-dark .input-icon { color:#f0a500; opacity:0.9; }
.modal-panel-dark .field-input { border:1px solid #4b5563; background:#1f2937; color:#f3f4f6; }
.modal-panel-dark .field-input:focus { background:#111827; }
.modal-panel-dark .field-input.error { border-color:#f87171; background:#450a0a; }
.modal-panel-dark .field-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.85); }
.modal-panel-dark .country-prefix { color:#cbd5e1; }
</style>
