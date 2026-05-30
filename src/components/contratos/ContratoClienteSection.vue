<template>
  <section class="form-section rounded-2xl border shadow-sm p-5 sm:p-6" :class="shellClass">
    <label class="field-label">Cliente (buscar por DUI)</label>
    <div class="relative">
      <i class="pi pi-id-card input-icon"></i>
      <input v-model="duiBusqueda" type="text" placeholder="00000000-0" class="field-input" @input="onBuscar" />
    </div>

    <div
      v-if="cliente"
      class="mt-3 rounded-xl border p-4"
      :class="alertaDocs.ok
        ? (isDark ? 'border-green-900/50 bg-green-950/20' : 'border-green-200 bg-green-50')
        : (isDark ? 'border-red-900/50 bg-red-950/30' : 'border-red-200 bg-red-50')"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-bold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">{{ cliente.nombre }}</p>
          <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">DUI: {{ cliente.dui }} · Tel: {{ cliente.telefono }}</p>
          <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-600'">Licencia vence: {{ formatFecha(cliente.vencimiento_licencia) }}</p>
        </div>
        <button type="button" class="text-xs font-bold underline" style="color:#c0392b;" @click="limpiar">Cambiar</button>
      </div>
      <p v-if="!alertaDocs.ok" class="text-xs font-bold mt-2" style="color:#c0392b;">
        <i class="pi pi-exclamation-triangle"></i> Licencia vencida — no puede continuar
      </p>
    </div>

    <p v-else-if="buscando" class="text-sm mt-3" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
      <i class="pi pi-spin pi-spinner"></i> Buscando...
    </p>
    <p v-else-if="duiBusqueda.trim() && !cliente" class="text-xs mt-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
      No encontrado. Registra al cliente desde el módulo Clientes.
    </p>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'
import { useClientesStore } from '@/stores/clientes'
import { documentosVigentes } from '@/utils/contratoFormatters'

const props = defineProps({ modelValue: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue'])

const { isDark } = useAppTheme()
const clientesStore = useClientesStore()

const duiBusqueda = ref('')
const cliente = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const buscando = ref(false)
let timer = null

const shellClass = computed(() => isDark.value ? 'form-section-dark bg-gray-900 border-gray-800' : 'form-section-light bg-white border-gray-100')
const alertaDocs = computed(() => documentosVigentes(cliente.value))

watch(cliente, (c) => { if (c?.dui) duiBusqueda.value = c.dui })

function onBuscar() {
  clearTimeout(timer)
  cliente.value = null
  if (!duiBusqueda.value.trim()) return
  timer = setTimeout(async () => {
    buscando.value = true
    const res = await clientesStore.buscarClientes(duiBusqueda.value.trim())
    const exacto = res.find((c) => c.dui === duiBusqueda.value.trim()) || res[0]
    if (exacto) cliente.value = exacto
    buscando.value = false
  }, 350)
}

function limpiar() { cliente.value = null; duiBusqueda.value = '' }
function formatFecha(f) { if (!f) return '—'; return new Date(f + 'T00:00:00').toLocaleDateString('es-SV') }

defineExpose({ alertaDocs })
</script>

<style scoped>
.field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:0.5rem; }
.input-icon { position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); font-size:0.875rem; pointer-events:none; }
.field-input { width:100%; padding:0.75rem 1rem 0.75rem 2.5rem; border-radius:0.75rem; font-size:0.875rem; outline:none; }
.form-section-light .field-label { color:#4b5563; }
.form-section-light .input-icon { color:#9ca3af; }
.form-section-light .field-input { border:1px solid #e5e7eb; background:#f9fafb; color:#1f2937; }
.form-section-dark .field-label { color:#9ca3af; }
.form-section-dark .input-icon { color:#6b7280; }
.form-section-dark .field-input { border:1px solid #4b5563; background:#1f2937; color:#f3f4f6; }
</style>
