<template>
  <section
    class="form-section rounded-2xl border shadow-sm p-5 sm:p-6"
    :class="isDark ? 'form-section-dark bg-gray-900 border-gray-800' : 'form-section-light bg-white border-gray-100'"
  >
    <label class="field-label">Cliente</label>
    <div class="relative">
      <i class="pi pi-search input-icon"></i>
      <input
        :value="busqueda"
        type="text"
        placeholder="Buscar por nombre, teléfono..."
        class="field-input"
        :disabled="!!clienteSeleccionado"
        @input="$emit('update:busqueda', $event.target.value); $emit('buscar')"
      />
    </div>

    <!-- Cliente seleccionado -->
    <div
      v-if="clienteSeleccionado"
      class="reserva-card reserva-card--selected mt-3 p-3.5 rounded-xl flex items-center gap-3"
    >
      <div class="card-avatar">{{ initials(clienteSeleccionado.nombre) }}</div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-sm truncate card-title">{{ clienteSeleccionado.nombre }}</p>
        <p class="text-xs card-sub">{{ clienteSeleccionado.dui }} · {{ clienteSeleccionado.telefono }}</p>
      </div>
      <button
        type="button"
        class="card-action-btn"
        @click="$emit('limpiar')"
      >Cambiar</button>
    </div>

    <template v-else>
      <div v-if="buscando" class="flex items-center gap-2 py-4 text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
        <i class="pi pi-spin pi-spinner"></i> Buscando...
      </div>

      <div v-else-if="resultados.length > 0" class="mt-3 space-y-2 max-h-52 overflow-y-auto">
        <button
          v-for="c in resultados"
          :key="c.id"
          type="button"
          class="reserva-card w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:brightness-110"
          @click="$emit('seleccionar', c)"
        >
          <div class="card-avatar card-avatar--sm">{{ initials(c.nombre) }}</div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm truncate card-title">{{ c.nombre }}</p>
            <p class="text-xs card-sub">{{ c.dui }} · {{ c.telefono }}</p>
          </div>
          <i class="pi pi-chevron-right text-xs card-chevron"></i>
        </button>
      </div>

      <p v-else-if="busqueda.trim()" class="text-xs mt-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
        No se encontraron resultados.
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
  </section>
</template>

<script setup>
import { useAppTheme } from '@/composables/useAppTheme'
import { initials } from '@/utils/reservaFormatters'

defineProps({
  busqueda:            { type: String, default: '' },
  clienteSeleccionado: { type: Object, default: null },
  resultados:          { type: Array, default: () => [] },
  buscando:            { type: Boolean, default: false },
})

defineEmits(['update:busqueda', 'buscar', 'seleccionar', 'limpiar', 'agregar-nuevo'])

const { isDark } = useAppTheme()
</script>

<style scoped>
.field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:0.5rem; }
.input-icon  { position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); font-size:0.875rem; pointer-events:none; }
.field-input { width:100%; padding:0.75rem 1rem 0.75rem 2.5rem; border-radius:0.75rem; font-size:0.875rem; transition:all 0.15s; outline:none; }
.field-input:disabled { opacity:0.7; cursor:not-allowed; }
.field-input:focus { border-color:#922b21; box-shadow:0 0 0 3px rgba(146,43,33,0.12); }

.reserva-card {
  border: 2px solid transparent;
  transition: border-color 0.15s, background 0.15s;
}
.form-section-light .reserva-card {
  background: #fff;
  border-color: #e5e7eb;
}
.form-section-light .reserva-card:hover {
  border-color: #922b21;
  background: #fafafa;
}
.form-section-dark .reserva-card {
  background: #1f2937;
  border-color: #374151;
}
.form-section-dark .reserva-card:hover {
  border-color: #922b21;
  background: #263040;
}

.form-section-light .field-label { color:#4b5563; }
.form-section-light .input-icon { color:#9ca3af; }
.form-section-light .field-input { border:1px solid #e5e7eb; background:#f9fafb; color:#1f2937; }
.form-section-light .field-input:focus { background:#fff; border-color:#922b21; }

.form-section-dark .field-label { color:#9ca3af; }
.form-section-dark .input-icon { color:#6b7280; }
.form-section-dark .field-input { border:1px solid #4b5563; background:#1f2937; color:#f3f4f6; }
.form-section-dark .field-input:focus { background:#111827; border-color:#922b21; }

.form-section-light .card-title { color:#111827; }
.form-section-light .card-sub { color:#6b7280; }
.form-section-light .card-chevron { color:#9ca3af; }
.form-section-dark .card-title { color:#f3f4f6; }
.form-section-dark .card-sub { color:#9ca3af; }
.form-section-dark .card-chevron { color:#6b7280; }

.card-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
  background: #922b21;
  color: #fff;
}
.card-avatar--sm { width: 2.25rem; height: 2.25rem; font-size: 0.75rem; }

.card-action-btn {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  transition: background 0.15s;
}
.form-section-light .card-action-btn {
  background: #f3f4f6;
  color: #374151;
}
.form-section-light .card-action-btn:hover { background: #e5e7eb; }
.form-section-dark .card-action-btn {
  background: #374151;
  color: #e5e7eb;
}
.form-section-dark .card-action-btn:hover { background: #4b5563; }

.reserva-card--selected {
  border-color: #922b21 !important;
  box-shadow: 0 0 0 1px rgba(146, 43, 33, 0.15);
}
</style>
