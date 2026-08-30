<template>
  <div class="telefono-pais">
    <div class="telefono-pais__row">
      <div ref="pickerRef" class="telefono-pais__picker">
        <button
          ref="buttonRef"
          type="button"
          class="telefono-pais__country"
          :class="[controlClass, isDark ? 'telefono-pais__control--dark' : 'telefono-pais__control--light', error ? 'error' : '']"
          @click="toggleMenu"
        >
          <img class="telefono-pais__flag" :src="flagSrc(paisSeleccionado)" :alt="paisSeleccionado.nombre" />
          <span class="telefono-pais__code">{{ paisSeleccionado.codigo }}</span>
          <span class="telefono-pais__prefix">{{ paisSeleccionado.prefijo }}</span>
          <i class="pi pi-chevron-down telefono-pais__chevron"></i>
        </button>
      </div>

      <input
        :value="numeroLocal"
        type="tel"
        inputmode="numeric"
        class="telefono-pais__input"
        :class="[controlClass, isDark ? 'telefono-pais__control--dark' : 'telefono-pais__control--light', error ? 'error' : '']"
        :placeholder="paisSeleccionado.placeholder"
        @input="onInput"
        @paste.prevent="onPaste"
      />
    </div>
    <p v-if="error" class="telefono-pais__error">{{ error }}</p>

    <Teleport to="body">
      <div
        v-if="menuOpen"
        ref="menuRef"
        class="telefono-pais__menu"
        :class="isDark ? 'telefono-pais__menu--dark' : 'telefono-pais__menu--light'"
        :style="menuStyle"
      >
        <button
          v-for="pais in paises"
          :key="pais.codigo"
          type="button"
          class="telefono-pais__option"
          :class="pais.codigo === paisSeleccionado.codigo ? 'telefono-pais__option--active' : ''"
          @click="seleccionarPais(pais.codigo)"
        >
          <img class="telefono-pais__flag" :src="flagSrc(pais)" :alt="pais.nombre" />
          <span class="telefono-pais__country-name">{{ pais.nombre }}</span>
          <span class="telefono-pais__option-prefix">{{ pais.prefijo }}</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import flagSv from 'flag-icons/flags/4x3/sv.svg'
import flagGt from 'flag-icons/flags/4x3/gt.svg'
import flagHn from 'flag-icons/flags/4x3/hn.svg'
import flagNi from 'flag-icons/flags/4x3/ni.svg'
import flagCr from 'flag-icons/flags/4x3/cr.svg'
import flagPa from 'flag-icons/flags/4x3/pa.svg'
import flagBz from 'flag-icons/flags/4x3/bz.svg'
import flagUs from 'flag-icons/flags/4x3/us.svg'
import flagMx from 'flag-icons/flags/4x3/mx.svg'
import { useAppTheme } from '@/composables/useAppTheme'
import {
  CODIGO_PAIS_DEFAULT,
  PAISES_TELEFONO,
  buscarPaisTelefono,
  detectarPaisTelefono,
  formatearTelefonoLocal,
  telefonoLocalNormalizado,
  telefonoNormalizadoCompleto,
} from '@/data/paisesTelefono'

const props = defineProps({
  modelValue: { type: String, default: '' },
  pais: { type: String, default: CODIGO_PAIS_DEFAULT },
  error: { type: String, default: '' },
  controlClass: { type: [String, Array, Object], default: '' },
})

const emit = defineEmits(['update:modelValue', 'update:pais'])
const { isDark } = useAppTheme()
const paises = PAISES_TELEFONO
const banderas = { sv: flagSv, gt: flagGt, hn: flagHn, ni: flagNi, cr: flagCr, pa: flagPa, bz: flagBz, us: flagUs, mx: flagMx }
const menuOpen = ref(false)
const pickerRef = ref(null)
const buttonRef = ref(null)
const menuRef = ref(null)
const menuStyle = ref({})

const paisSeleccionado = computed(() => buscarPaisTelefono(props.pais))
const numeroLocal = computed(() => formatearTelefonoLocal(props.modelValue, paisSeleccionado.value))

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return
    const paisDetectado = detectarPaisTelefono(value)
    if (paisDetectado.codigo !== props.pais) emit('update:pais', paisDetectado.codigo)
  },
  { immediate: true },
)

function flagSrc(pais) {
  return banderas[pais.iso] || flagSv
}

async function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    await nextTick()
    posicionarMenu()
  }
}

function posicionarMenu() {
  const rect = buttonRef.value?.getBoundingClientRect()
  if (!rect) return
  const margen = 12
  const espacioAbajo = window.innerHeight - rect.bottom - margen
  const espacioArriba = rect.top - margen
  const abrirArriba = espacioAbajo < 180 && espacioArriba > espacioAbajo
  const altoMaximo = Math.max(132, Math.min(260, abrirArriba ? espacioArriba : espacioAbajo))

  menuStyle.value = {
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: `${altoMaximo}px`,
    top: abrirArriba ? 'auto' : `${rect.bottom + 6}px`,
    bottom: abrirArriba ? `${window.innerHeight - rect.top + 6}px` : 'auto',
  }
}

function seleccionarPais(codigo) {
  const siguientePais = buscarPaisTelefono(codigo)
  const localActual = telefonoLocalNormalizado(props.modelValue, paisSeleccionado.value)
  emit('update:pais', siguientePais.codigo)
  emit('update:modelValue', telefonoNormalizadoCompleto(localActual, siguientePais))
  menuOpen.value = false
}

function onInput(event) {
  emit('update:modelValue', telefonoNormalizadoCompleto(event.target.value, paisSeleccionado.value))
}

function onPaste(event) {
  emit('update:modelValue', telefonoNormalizadoCompleto(event.clipboardData?.getData('text') || '', paisSeleccionado.value))
}

function cerrarAlClickFuera(event) {
  const clickEnBoton = pickerRef.value?.contains(event.target)
  const clickEnMenu = menuRef.value?.contains(event.target)
  if (!clickEnBoton && !clickEnMenu) menuOpen.value = false
}

function actualizarMenuAbierto() {
  if (menuOpen.value) posicionarMenu()
}

onMounted(() => {
  document.addEventListener('click', cerrarAlClickFuera)
  window.addEventListener('resize', actualizarMenuAbierto)
  window.addEventListener('scroll', actualizarMenuAbierto, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', cerrarAlClickFuera)
  window.removeEventListener('resize', actualizarMenuAbierto)
  window.removeEventListener('scroll', actualizarMenuAbierto, true)
})
</script>

<style scoped>
.telefono-pais__row { display:grid; grid-template-columns: 9.5rem minmax(0, 1fr); gap:0.5rem; }
.telefono-pais__picker { position:relative; }
.telefono-pais__country,
.telefono-pais__input { min-height:2.75rem; border-radius:0.75rem; font-size:0.875rem; outline:none; transition:all 0.15s; border:1px solid; }
.telefono-pais__country { width:100%; padding:0.72rem 0.65rem; display:flex; align-items:center; gap:0.35rem; }
.telefono-pais__input { width:100%; padding:0.75rem 1rem; }
.telefono-pais__control--light { border-color:#d1d5db; background:#f9fafb; color:#1f2937; }
.telefono-pais__control--light:focus { border-color:#c0392b; box-shadow:0 0 0 3px rgba(192,57,43,0.1); background:#fff; }
.telefono-pais__control--dark { border-color:#4b5563; background:#1f2937; color:#f3f4f6; }
.telefono-pais__control--dark:focus { border-color:#c0392b; box-shadow:0 0 0 3px rgba(192,57,43,0.18); background:#111827; }
.telefono-pais__flag { width:1.25rem; height:0.9rem; border-radius:0.16rem; flex-shrink:0; object-fit:cover; display:block; box-shadow:inset 0 0 0 1px rgba(15,23,42,0.14); }
.telefono-pais__code { font-weight:700; }
.telefono-pais__prefix { color:#475569; }
.telefono-pais__chevron { margin-left:auto; font-size:0.65rem; color:#94a3b8; }
.telefono-pais__menu { position:fixed; z-index:9999; overflow-y:auto; border:1px solid; border-radius:0.75rem; box-shadow:0 12px 24px rgba(15,23,42,0.18); }
.telefono-pais__menu--light { background:#fff; border-color:#cbd5e1; }
.telefono-pais__menu--dark { background:#111827; border-color:#374151; }
.telefono-pais__option { width:100%; min-height:2.45rem; padding:0.5rem 0.7rem; display:flex; align-items:center; gap:0.45rem; font-size:0.82rem; text-align:left; }
.telefono-pais__option:hover,
.telefono-pais__option--active { background:#fee2e2; color:#9f2a21; }
.telefono-pais__menu--dark .telefono-pais__option:hover,
.telefono-pais__menu--dark .telefono-pais__option--active { background:#1f2937; color:#f0a500; }
.telefono-pais__country-name { min-width:0; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.telefono-pais__option-prefix { color:inherit; font-weight:700; }
.telefono-pais__error { font-size:0.7rem; color:#c0392b; margin-top:0.25rem; }
.telefono-pais__country.error,
.telefono-pais__input.error { border-color:#f87171; background:#fef2f2; }

:global(.modal-panel-dark) .telefono-pais__prefix { color:#cbd5e1; }

@media (max-width: 640px) {
  .telefono-pais__row { grid-template-columns: 1fr; }
}
</style>
