<template>
  <section class="form-section rounded-2xl border shadow-sm p-5 sm:p-6" :class="shellClass">
    <label class="field-label">Cliente</label>
    <div class="relative">
      <i class="pi pi-search input-icon"></i>
      <input
        v-model="terminoBusqueda"
        type="text"
        placeholder="Buscar por nombre, DUI o teléfono..."
        class="field-input"
        :disabled="!!cliente"
        @input="onBuscar"
      />
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

    <template v-else>
      <div v-if="buscando" class="text-sm mt-3" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
        <i class="pi pi-spin pi-spinner"></i> Buscando...
      </div>

      <div v-else-if="resultados.length > 0" class="mt-3 space-y-2 max-h-52 overflow-y-auto">
        <button
          v-for="c in resultados"
          :key="c.id"
          type="button"
          class="w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all hover:shadow-sm"
          :class="isDark ? 'border-gray-700 bg-gray-800/60 hover:bg-gray-800' : 'border-gray-100 bg-gray-50 hover:bg-white'"
          @click="seleccionar(c)"
        >
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm truncate" :class="isDark ? 'text-gray-100' : 'text-gray-900'">{{ c.nombre }}</p>
            <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-600'">{{ c.dui }} · {{ c.telefono }}</p>
          </div>
          <i class="pi pi-chevron-right text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'"></i>
        </button>
      </div>

      <p v-else-if="terminoBusqueda.trim()" class="text-xs mt-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
        No encontrado. Puedes registrar un cliente nuevo.
      </p>

      <button
        type="button"
        class="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border-2 border-dashed"
        :class="isDark
          ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50'
          : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'"
        @click="$emit('agregar-nuevo')"
      >
        <i class="pi pi-user-plus"></i>
        Agregar nuevo cliente
      </button>
    </template>

    <!-- Estado de reservas del cliente -->
    <div v-if="cliente && alertaDocs.ok" class="mt-4 space-y-3">
      <div v-if="cargandoReservas" class="flex items-center gap-2 text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
        <i class="pi pi-spin pi-spinner"></i>
        Consultando reservas del cliente...
      </div>

      <div
        v-else-if="sinReserva"
        class="rounded-xl border p-4"
        :class="isDark ? 'border-amber-900/50 bg-amber-950/25' : 'border-amber-200 bg-amber-50'"
      >
        <p class="text-sm font-bold flex items-center gap-2" :class="isDark ? 'text-amber-300' : 'text-amber-900'">
          <i class="pi pi-info-circle"></i>
          Este cliente no tiene reserva activa
        </p>
        <p class="text-xs mt-2 leading-relaxed" :class="isDark ? 'text-amber-200/80' : 'text-amber-800'">
          Para crear un contrato primero debes registrar una reserva con fechas y vehículo.
        </p>
        <router-link
          :to="{ name: 'reservas-nueva' }"
          class="inline-flex items-center gap-1.5 mt-3 text-xs font-bold"
          style="color:#c0392b;"
        >
          <i class="pi pi-calendar-plus"></i>
          Crear reserva
        </router-link>
      </div>

      <div v-else-if="reservas.length > 1 && !reservaSeleccionada" class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
          Reservas disponibles ({{ reservas.length }})
        </p>
        <button
          v-for="r in reservas"
          :key="r.id"
          type="button"
          class="w-full text-left rounded-xl border p-3 transition-all hover:shadow-sm"
          :class="isDark ? 'border-gray-700 bg-gray-800/60 hover:bg-gray-800' : 'border-gray-200 bg-white hover:border-red-200'"
          @click="$emit('reserva-elegir', r)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold" style="color:#922b21;">Reserva #{{ r.id }}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" :class="estadoBadge(r.estado)">{{ r.estado }}</span>
          </div>
          <p class="text-sm font-semibold mt-1" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ nombreVehiculo(r.vehiculo) }}</p>
          <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
            {{ formatFecha(r.fecha_inicio) }} → {{ formatFecha(r.fecha_fin) }}
          </p>
        </button>
      </div>

      <div
        v-else-if="reservaSeleccionada"
        class="rounded-xl border p-4"
        :class="isDark ? 'border-red-900/40 bg-red-950/20' : 'border-red-100 bg-red-50/60'"
      >
        <p class="text-xs font-bold uppercase tracking-wider mb-2" style="color:#922b21;">
          <i class="pi pi-check-circle"></i>
          Reserva vinculada #{{ reservaSeleccionada.id }}
        </p>
        <p class="text-sm font-semibold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ nombreVehiculo(reservaSeleccionada.vehiculo) }}</p>
        <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
          Placa: {{ reservaSeleccionada.vehiculo?.placa || '—' }}
        </p>
        <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
          Periodo: {{ formatFecha(reservaSeleccionada.fecha_inicio) }} → {{ formatFecha(reservaSeleccionada.fecha_fin) }}
        </p>
        <p class="text-[11px] mt-2" :class="isDark ? 'text-gray-500' : 'text-gray-500'">
          Fechas y vehículo se completaron automáticamente en el paso 2.
        </p>
        <button
          v-if="reservas.length > 1"
          type="button"
          class="text-xs font-bold mt-2 underline"
          style="color:#c0392b;"
          @click="$emit('reserva-limpiar')"
        >
          Elegir otra reserva
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'
import { useClientesStore } from '@/stores/clientes'
import { documentosVigentes } from '@/utils/contratoFormatters'
import { formatFecha, nombreVehiculo } from '@/utils/reservaFormatters'

const props = defineProps({
  modelValue: { type: Object, default: null },
  cargandoReservas: { type: Boolean, default: false },
  sinReserva: { type: Boolean, default: false },
  reservas: { type: Array, default: () => [] },
  reservaSeleccionada: { type: Object, default: null },
})

const emit = defineEmits([
  'update:modelValue',
  'cliente-seleccionado',
  'cliente-limpiado',
  'reserva-elegir',
  'reserva-limpiar',
  'agregar-nuevo',
])

const { isDark } = useAppTheme()
const clientesStore = useClientesStore()

const terminoBusqueda = ref('')
const resultados = ref([])
const cliente = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const buscando = ref(false)
let timer = null
let busquedaActiva = 0

const shellClass = computed(() =>
  isDark.value ? 'form-section-dark bg-gray-900 border-gray-800' : 'form-section-light bg-white border-gray-100',
)
const alertaDocs = computed(() => documentosVigentes(cliente.value))

function estadoBadge(estado) {
  const map = {
    PENDIENTE: isDark.value ? 'bg-yellow-950/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
    CONFIRMADA: isDark.value ? 'bg-green-950/50 text-green-400' : 'bg-green-100 text-green-800',
  }
  return map[estado] ?? (isDark.value ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600')
}

function onBuscar() {
  clearTimeout(timer)
  resultados.value = []

  const term = terminoBusqueda.value.trim()
  if (!term) {
    buscando.value = false
    return
  }

  const id = ++busquedaActiva
  timer = setTimeout(async () => {
    buscando.value = true
    try {
      const res = await clientesStore.buscarClientes(term)
      if (id !== busquedaActiva || term !== terminoBusqueda.value.trim()) return
      resultados.value = res
    } finally {
      if (id === busquedaActiva) buscando.value = false
    }
  }, 350)
}

function seleccionar(c) {
  busquedaActiva++
  clearTimeout(timer)
  cliente.value = c
  terminoBusqueda.value = ''
  resultados.value = []
  buscando.value = false
  emit('cliente-seleccionado', c)
}

function limpiar() {
  busquedaActiva++
  clearTimeout(timer)
  cliente.value = null
  terminoBusqueda.value = ''
  resultados.value = []
  buscando.value = false
  emit('cliente-limpiado')
}

defineExpose({ alertaDocs })
</script>

<style scoped>
.field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:0.5rem; }
.input-icon { position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); font-size:0.875rem; pointer-events:none; }
.field-input { width:100%; padding:0.75rem 1rem 0.75rem 2.5rem; border-radius:0.75rem; font-size:0.875rem; outline:none; }
.field-input:disabled { opacity:0.7; cursor:not-allowed; }
.form-section-light .field-label { color:#4b5563; }
.form-section-light .input-icon { color:#9ca3af; }
.form-section-light .field-input { border:1px solid #e5e7eb; background:#f9fafb; color:#1f2937; }
.form-section-dark .field-label { color:#9ca3af; }
.form-section-dark .input-icon { color:#6b7280; }
.form-section-dark .field-input { border:1px solid #4b5563; background:#1f2937; color:#f3f4f6; }
</style>
