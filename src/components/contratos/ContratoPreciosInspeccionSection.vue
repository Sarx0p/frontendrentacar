<template>
  <section class="form-section rounded-2xl border shadow-sm p-5 sm:p-6 space-y-5" :class="shellClass">
    <div>
      <label class="field-label">Calculadora de precios</label>
      <div class="grid grid-cols-2 gap-3 text-sm mt-3">
        <div class="stat-box" :class="isDark ? 'stat-box--dark' : 'stat-box--light'">
          <span class="stat-label">Días</span><strong :class="isDark ? 'text-gray-100' : 'text-gray-900'">{{ dias }}</strong>
        </div>
        <div class="stat-box" :class="isDark ? 'stat-box--dark' : 'stat-box--light'">
          <span class="stat-label">Precio/día</span><strong :class="isDark ? 'text-gray-100' : 'text-gray-900'">${{ formatPrecio(precioDia) }}</strong>
        </div>
        <div class="stat-box" :class="isDark ? 'stat-box--dark' : 'stat-box--light'">
          <span class="stat-label">Subtotal</span><strong :class="isDark ? 'text-gray-100' : 'text-gray-900'">${{ formatPrecio(subtotal) }}</strong>
        </div>
        <div class="stat-box" :class="isDark ? 'stat-box--dark' : 'stat-box--light'">
          <span class="stat-label">Descuento</span>
          <input
            :value="descuento"
            type="number"
            min="0"
            step="0.01"
            class="field-input mt-1 w-full field-input--plain"
            @input="$emit('update:descuento', Number($event.target.value) || 0)"
          />
        </div>
      </div>
      <div class="mt-4 p-4 rounded-xl text-white flex justify-between items-center" style="background:linear-gradient(135deg,#922b21,#6b2118);">
        <span class="font-bold text-sm">Total estimado</span>
        <span class="text-2xl font-extrabold">${{ formatPrecio(total) }}</span>
      </div>
    </div>

    <div>
      <label class="field-label">Inspección física (check-out)</label>
      <p class="text-xs mb-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Nivel de combustible al entregar</p>
      <input type="range" min="0" max="4" step="1" :value="combustibleIdx" class="w-full accent-red-800" @input="onCombustible($event.target.value)" />
      <p class="text-sm font-bold mt-1" :class="isDark ? 'text-gray-200' : 'text-gray-800'">{{ nivelLabel }}</p>
      <label class="field-label mt-4">Observaciones previas</label>
      <textarea
        :value="observacionesEntrega"
        rows="4"
        class="field-input w-full resize-none field-input--plain"
        placeholder="Rayones, golpes, estado general..."
        @input="$emit('update:observacionesEntrega', $event.target.value)"
      ></textarea>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'
import { NIVELES_COMBUSTIBLE, formatPrecio } from '@/utils/contratoFormatters'

const props = defineProps({
  dias:                 { type: Number, default: 0 },
  precioDia:            { type: Number, default: 0 },
  descuento:            { type: Number, default: 0 },
  nivelCombustible:     { type: String, default: '1/2' },
  observacionesEntrega: { type: String, default: '' },
})

const emit = defineEmits(['update:descuento', 'update:nivelCombustible', 'update:observacionesEntrega'])

const { isDark } = useAppTheme()
const shellClass = computed(() => isDark.value ? 'form-section-dark bg-gray-900 border-gray-800' : 'form-section-light bg-white border-gray-100')
const subtotal = computed(() => props.dias * props.precioDia)
const total = computed(() => Math.max(0, subtotal.value - props.descuento))
const combustibleIdx = computed(() => {
  const idx = NIVELES_COMBUSTIBLE.findIndex((n) => n.value === props.nivelCombustible)
  return idx >= 0 ? idx : 2
})
const nivelLabel = computed(() => NIVELES_COMBUSTIBLE[combustibleIdx.value]?.label || props.nivelCombustible)

function onCombustible(idx) {
  const nivel = NIVELES_COMBUSTIBLE[Number(idx)]
  if (nivel) emit('update:nivelCombustible', nivel.value)
}
</script>

<style scoped>
.field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:0.5rem; }
.field-input { padding:0.65rem 0.75rem; border-radius:0.75rem; font-size:0.875rem; outline:none; }
.field-input--plain { padding-left:0.75rem; }
.stat-box { padding:0.75rem; border-radius:0.75rem; border:1px solid; }
.stat-box--light { border-color:#e5e7eb; background:#f9fafb; }
.stat-box--dark { border-color:#374151; background:#1f2937; }
.stat-label { display:block; font-size:0.65rem; opacity:0.6; text-transform:uppercase; margin-bottom:0.25rem; }
.form-section-light .field-label { color:#4b5563; }
.form-section-light .field-input { border:1px solid #e5e7eb; background:#f9fafb; color:#1f2937; }
.form-section-dark .field-label { color:#9ca3af; }
.form-section-dark .field-input { border:1px solid #4b5563; background:#1f2937; color:#f3f4f6; }
</style>
