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
          class="rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          :class="isDark ? 'bg-gray-900' : 'bg-white'"
          @click.stop
        >
          <div
            class="flex items-center justify-between px-6 py-5 border-b"
            :class="isDark ? 'border-gray-800' : 'border-gray-100'"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center" :style="iconWrapStyle">
                <i :class="['pi', config.icon, 'text-base']" :style="{ color: config.color }"></i>
              </div>
              <div>
                <p class="font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">{{ tituloModal }}</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ subtituloModal }}</p>
              </div>
            </div>
            <button type="button" @click="$emit('cerrar')" class="w-8 h-8 rounded-lg flex items-center justify-center" :class="isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'">
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>

          <form class="px-6 py-5 space-y-4" @submit.prevent="handleGuardar">
            <div v-if="tipo === 'modelo'">
              <label class="field-label">Marca</label>
              <select v-model="form.marca_id" class="field-input" :class="inputClass(errors.marca_id)">
                <option value="">Seleccionar marca</option>
                <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
              </select>
              <p v-if="errors.marca_id" class="field-error">{{ errors.marca_id }}</p>
            </div>

            <div>
              <label class="field-label">{{ labelNombre }}</label>
              <input
                v-model="form.nombre"
                type="text"
                class="field-input"
                :class="inputClass(errors.nombre)"
                :maxlength="nombreMax"
                :placeholder="config.placeholder"
              />
              <p v-if="errors.nombre" class="field-error">{{ errors.nombre }}</p>
            </div>

            <div v-if="tipo === 'categoria'">
              <label class="field-label">Precio por día ($)</label>
              <input v-model="form.precio_dia" type="number" min="1" step="0.01" class="field-input" :class="inputClass(errors.precio_dia)" placeholder="25.00" />
              <p v-if="errors.precio_dia" class="field-error">{{ errors.precio_dia }}</p>
            </div>

            <div v-if="tipo === 'propietario'">
              <label class="field-label">Teléfono</label>
              <div class="phone-row">
                <div class="country-picker">
                  <button
                    type="button"
                    class="country-trigger"
                    :class="inputClass(false)"
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
                  class="field-input"
                  :class="inputClass(errors.telefono)"
                  :placeholder="paisTelefono.placeholder"
                  @input="onTelefonoInput"
                  @paste.prevent="onTelefonoPaste"
                />
              </div>
              <p v-if="errors.telefono" class="field-error">{{ errors.telefono }}</p>
            </div>

            <div v-if="tipo === 'propietario'">
              <label class="field-label">Tipo de propietario</label>
              <select v-model="form.tipo_propietario" class="field-input" :class="inputClass(errors.tipo_propietario)">
                <option value="">Seleccionar tipo</option>
                <option v-for="t in tiposPropietarioDisponibles" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
              <p v-if="errors.tipo_propietario" class="field-error">{{ errors.tipo_propietario }}</p>
            </div>

            <div v-if="globalError && !hasFieldErrors" class="text-sm rounded-xl p-3 border" style="background:#fef2f2; color:#c0392b; border-color:#fecaca;">
              {{ globalError }}
            </div>

            <div class="flex gap-3 pt-1">
              <button type="button" @click="$emit('cerrar')" class="flex-1 py-2.5 rounded-xl font-bold text-sm border-2" :class="isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="flex-1 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-60" style="background:#c0392b;">
                <i v-if="loading" class="pi pi-spin pi-spinner mr-1"></i>
                Guardar
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
import api from '@/services/api'
import { useAppTheme } from '@/composables/useAppTheme'
import { fetchAllPaginated } from '@/utils/apiPagination'

const props = defineProps({
  visible: { type: Boolean, default: false },
  tipo:    { type: String, default: 'marca' },
  registroEdicion: { type: Object, default: null },
})

const emit = defineEmits(['cerrar', 'guardado'])

const { isDark } = useAppTheme()

const loading = ref(false)
const globalError = ref('')
const marcas = ref([])
const categoriasExistentes = ref([])
const modelosExistentes = ref([])
const propietariosExistentes = ref([])
const countryMenuOpen = ref(false)
const form = reactive({ nombre: '', precio_dia: '', marca_id: '', telefono: '', pais_telefono: 'SV', tipo_propietario: '' })
const errors = reactive({ nombre: '', precio_dia: '', marca_id: '', telefono: '', tipo_propietario: '' })
const nombreFlexibleRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ./'-]+$/
const nombrePersonaRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]+$/
const contieneLetraRegex = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/

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

const tiposPropietario = [
  { value: 'PROPIO', label: 'Propio' },
  { value: 'TERCERO', label: 'Tercero' },
  { value: 'FAMILIAR', label: 'Familiar' },
]

const configs = {
  marca: {
    titulo: 'Nueva marca',
    subtitulo: 'Registra una marca de vehículo',
    placeholder: 'Ej. Toyota, Honda...',
    icon: 'pi-bookmark',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  categoria: {
    titulo: 'Nueva categoría',
    subtitulo: 'Define tarifa diaria de la categoría',
    placeholder: 'Ej. Económico, SUV...',
    icon: 'pi-tags',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  modelo: {
    titulo: 'Nuevo modelo',
    subtitulo: 'Asócialo a una marca existente',
    placeholder: 'Ej. Corolla, Civic...',
    icon: 'pi-car',
    color: '#c0392b',
    bg: '#fef2f2',
  },
  propietario: {
    titulo: 'Nuevo propietario',
    subtitulo: 'Registra quién es dueño del vehículo',
    placeholder: 'Nombre completo',
    icon: 'pi-user',
    color: '#16a34a',
    bg: '#f0fdf4',
  },
}

const labelNombre = computed(() => {
  if (props.tipo === 'categoria') return 'Nombre de categoría'
  if (props.tipo === 'propietario') return 'Nombre del propietario'
  return 'Nombre'
})

const config = computed(() => configs[props.tipo] || configs.marca)
const modoEdicionPropietario = computed(() => props.tipo === 'propietario' && Boolean(props.registroEdicion?.id))
const tituloModal = computed(() => modoEdicionPropietario.value ? 'Editar propietario' : config.value.titulo)
const subtituloModal = computed(() =>
  modoEdicionPropietario.value ? 'Actualiza los datos del propietario' : config.value.subtitulo,
)
const iconWrapStyle = computed(() => ({ background: config.value.bg }))
const paisTelefono = computed(() => paisesTelefono.find((pais) => pais.codigo === form.pais_telefono) || paisesTelefono[0])
const hasFieldErrors = computed(() => Object.values(errors).some(Boolean))
const nombreMax = computed(() => props.tipo === 'marca' || props.tipo === 'categoria' ? 80 : 100)
const hayPropietarioPropio = computed(() =>
  propietariosExistentes.value.some((p) =>
    String(p.tipo_propietario || '').toUpperCase() === 'PROPIO'
    && (!modoEdicionPropietario.value || Number(p.id) !== Number(props.registroEdicion?.id)),
  ),
)
const tiposPropietarioDisponibles = computed(() =>
  hayPropietarioPropio.value
    ? tiposPropietario.filter((tipo) => tipo.value !== 'PROPIO')
    : tiposPropietario,
)

function inputClass(hasError) {
  return [hasError ? 'error' : '', isDark.value ? 'field-input-dark' : 'field-input-light']
}

async function cargarMarcas() {
  try {
    const { items } = await fetchAllPaginated((params) => api.get('/marcas', { params }))
    marcas.value = items
  } catch {
    marcas.value = []
  }
}

async function cargarCategoriasExistentes() {
  try {
    const { items } = await fetchAllPaginated((params) => api.get('/categorias', { params }))
    categoriasExistentes.value = items
  } catch {
    categoriasExistentes.value = []
  }
}

async function cargarModelosExistentes() {
  try {
    const { items } = await fetchAllPaginated((params) => api.get('/modelos', { params }))
    modelosExistentes.value = items
  } catch {
    modelosExistentes.value = []
  }
}

async function cargarPropietariosExistentes() {
  try {
    const { items } = await fetchAllPaginated((params) => api.get('/admin/propietarios', { params }))
    propietariosExistentes.value = items
  } catch {
    propietariosExistentes.value = []
  }
}

watch(
  () => [props.visible, props.tipo, props.registroEdicion],
  async ([vis]) => {
    if (!vis) return
    globalError.value = ''
    form.nombre = ''
    form.precio_dia = ''
    form.marca_id = ''
    form.telefono = ''
    form.pais_telefono = 'SV'
    countryMenuOpen.value = false
    form.tipo_propietario = ''
    Object.keys(errors).forEach((k) => { errors[k] = '' })
    if (props.tipo === 'marca' || props.tipo === 'modelo') await cargarMarcas()
    if (props.tipo === 'categoria') await cargarCategoriasExistentes()
    if (props.tipo === 'modelo') await cargarModelosExistentes()
    if (props.tipo === 'propietario') await cargarPropietariosExistentes()
    if (modoEdicionPropietario.value) {
      const propietario = props.registroEdicion
      const pais = detectarPaisTelefono(propietario.telefono)
      form.nombre = propietario.nombre || ''
      form.pais_telefono = pais.codigo
      form.telefono = formatearTelefono(propietario.telefono || '', pais)
      form.tipo_propietario = String(propietario.tipo_propietario || '').toUpperCase()
    }
  },
)

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

function detectarPaisTelefono(value) {
  const digitos = soloDigitos(value)
  return paisesTelefono.find((pais) => digitos.startsWith(soloDigitos(pais.prefijo))) || paisesTelefono[0]
}

function telefonoNormalizadoCompleto() {
  return `${paisTelefono.value.prefijo} ${form.telefono}`
}

function telefonoLocalNormalizado(value, pais = paisTelefono.value) {
  return quitarPrefijoPais(soloDigitos(value), pais)
}

function normalizarNombre(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

function existeNombre(lista, nombre, extra = () => true) {
  const nombreNormalizado = normalizarNombre(nombre)
  return lista.some((item) => normalizarNombre(item.nombre) === nombreNormalizado && extra(item))
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

function validar() {
  Object.keys(errors).forEach((k) => { errors[k] = '' })
  let ok = true
  const nombre = form.nombre.trim().replace(/\s+/g, ' ')
  if (!nombre) {
    errors.nombre = 'El nombre es obligatorio.'
    ok = false
  } else if (nombre.length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres.'
    ok = false
  } else if (nombre.length > nombreMax.value) {
    errors.nombre = `El nombre no puede tener más de ${nombreMax.value} caracteres.`
    ok = false
  } else if (props.tipo === 'propietario' && !nombrePersonaRegex.test(nombre)) {
    errors.nombre = 'El nombre solo debe contener letras y signos básicos.'
    ok = false
  } else if (props.tipo !== 'propietario' && !nombreFlexibleRegex.test(nombre)) {
    errors.nombre = 'El nombre contiene caracteres no permitidos.'
    ok = false
  } else if (props.tipo === 'categoria' && !contieneLetraRegex.test(nombre)) {
    errors.nombre = 'La categoría debe incluir al menos una letra.'
    ok = false
  } else if (props.tipo === 'marca' && existeNombre(marcas.value, nombre)) {
    errors.nombre = 'Ya existe una marca registrada con ese nombre.'
    ok = false
  } else if (props.tipo === 'categoria' && existeNombre(categoriasExistentes.value, nombre)) {
    errors.nombre = 'Ya existe una categoría registrada con ese nombre.'
    ok = false
  }
  if (props.tipo === 'categoria') {
    const precio = Number(form.precio_dia)
    const tieneMasDeDosDecimales = !/^\d+(\.\d{1,2})?$/.test(String(form.precio_dia).trim())
    if (!form.precio_dia || Number.isNaN(precio) || precio < 1) {
      errors.precio_dia = 'El precio debe ser de $1.00 o más.'
      ok = false
    } else if (tieneMasDeDosDecimales) {
      errors.precio_dia = 'Usa máximo dos decimales.'
      ok = false
    }
  }
  if (props.tipo === 'modelo' && !form.marca_id) {
    errors.marca_id = 'Selecciona una marca'
    ok = false
  } else if (props.tipo === 'modelo' && existeNombre(
    modelosExistentes.value,
    nombre,
    (modelo) => Number(modelo.marca_id || modelo.marca?.id) === Number(form.marca_id),
  )) {
    errors.nombre = 'Ya existe un modelo con ese nombre para la marca seleccionada.'
    ok = false
  }
  if (props.tipo === 'propietario') {
    const telefonoLocal = telefonoLocalNormalizado(form.telefono)
    if (!telefonoLocal) {
      errors.telefono = 'Requerido'
      ok = false
    } else if (telefonoLocal.length !== paisTelefono.value.digitos) {
      errors.telefono = `Debe tener ${paisTelefono.value.digitos} dígitos para ${paisTelefono.value.prefijo}.`
      ok = false
    } else if (propietariosExistentes.value.some((p) =>
      Number(p.id) !== Number(props.registroEdicion?.id)
      && telefonoLocalNormalizado(p.telefono) === telefonoLocal,
    )) {
      errors.telefono = 'Ya existe un propietario registrado con ese número de teléfono.'
      ok = false
    }
    if (!form.tipo_propietario) { errors.tipo_propietario = 'Selecciona un tipo'; ok = false }
    if (form.tipo_propietario === 'PROPIO' && hayPropietarioPropio.value) {
      errors.tipo_propietario = 'Ya existe un propietario propio registrado.'
      ok = false
    }
  }
  return ok
}

async function handleGuardar() {
  if (!validar()) return
  loading.value = true
  globalError.value = ''
  try {
    let res
    const nombre = form.nombre.trim().replace(/\s+/g, ' ')
    if (props.tipo === 'marca') {
      res = await api.post('/marcas', { nombre })
    } else if (props.tipo === 'categoria') {
      res = await api.post('/categorias', { nombre, precio_dia: Number(form.precio_dia) })
    } else if (props.tipo === 'modelo') {
      res = await api.post('/modelos', { nombre, marca_id: Number(form.marca_id) })
    } else if (props.tipo === 'propietario') {
      const payload = {
        nombre,
        telefono: telefonoNormalizadoCompleto(),
        tipo_propietario: form.tipo_propietario,
      }
      res = modoEdicionPropietario.value
        ? await api.put(`/admin/propietarios/${props.registroEdicion.id}`, payload)
        : await api.post('/admin/propietarios', payload)
    }
    emit('guardado', { tipo: props.tipo, data: res.data.data, modoEdicion: modoEdicionPropietario.value })
    emit('cerrar')
  } catch (e) {
    const responseErrors = e.response?.data?.errors || {}
    Object.keys(errors).forEach((key) => {
      errors[key] = Array.isArray(responseErrors[key]) ? responseErrors[key][0] : responseErrors[key] || ''
    })
    if (responseErrors.telefono && !errors.telefono) {
      errors.telefono = Array.isArray(responseErrors.telefono) ? responseErrors.telefono[0] : responseErrors.telefono
    }
    const firstError = Object.values(responseErrors).flat().find(Boolean)
    globalError.value = firstError || e.response?.data?.message || 'No se pudo guardar.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:0.375rem; color:#4b5563; }
.field-input { width:100%; padding:0.75rem 1rem; border-radius:0.75rem; font-size:0.875rem; outline:none; }
.phone-row { display:grid; grid-template-columns: 9.5rem minmax(0, 1fr); gap:0.5rem; }
.country-select { width:100%; padding:0.75rem 0.65rem; border-radius:0.75rem; font-size:0.875rem; outline:none; }
.country-picker { position:relative; }
.country-trigger { width:100%; min-height:2.75rem; padding:0.72rem 0.65rem; border-radius:0.75rem; display:flex; align-items:center; gap:0.35rem; font-size:0.875rem; outline:none; }
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
.country-menu-dark { background:#1f2937; border-color:#374151; }
.country-option { width:100%; padding:0.65rem 0.75rem; display:flex; align-items:center; gap:0.45rem; font-size:0.875rem; text-align:left; }
.country-option:hover, .country-option-active { background:#dbeafe; color:#1d4ed8; }
.field-input-light { border:1px solid #cbd5e1; background:#f8fafc; color:#1f2937; }
.field-input-light:focus { border-color:#c0392b; box-shadow:0 0 0 3px rgba(192,57,43,0.1); background:#fff; }
.field-input-dark { border:1px solid #374151; background:#1f2937; color:#f3f4f6; }
.field-input.error { border-color:#f87171; }
.field-error { font-size:0.7rem; color:#c0392b; margin-top:0.25rem; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

