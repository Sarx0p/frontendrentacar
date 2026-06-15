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
          class="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          :class="isDark ? 'bg-gray-900' : 'bg-white'"
          @click.stop
        >
          <div class="flex items-center justify-between px-6 py-5 border-b" :class="isDark ? 'border-gray-800' : 'border-gray-100'">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-red-100">
                <i class="pi pi-times-circle text-red-600"></i>
              </div>
              <div>
                <p class="font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">Cancelar reserva</p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">N° {{ reserva?.id }}</p>
              </div>
            </div>
            <button type="button" class="w-8 h-8 rounded-lg border flex items-center justify-center" @click="$emit('cerrar')">
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>

          <form class="px-6 py-5 space-y-4" @submit.prevent="confirmar">
            <div class="rounded-xl p-3 text-sm space-y-1" :class="isDark ? 'bg-gray-800/60 text-gray-300' : 'bg-gray-50 text-gray-600'">
              <p><span class="opacity-60">Cliente:</span> <strong>{{ reserva?.cliente?.nombre }}</strong></p>
              <p><span class="opacity-60">Vehículo:</span> <strong>{{ nombreVehiculo(reserva?.vehiculo) }}</strong> · {{ reserva?.vehiculo?.placa }}</p>
              <p><span class="opacity-60">Periodo:</span> {{ formatFecha(reserva?.fecha_inicio) }} → {{ formatFecha(reserva?.fecha_fin) }}</p>
            </div>

            <p class="text-xs rounded-lg p-3 border" :class="isDark ? 'text-amber-300 bg-amber-950/30 border-amber-900/40' : 'text-amber-800 bg-amber-50 border-amber-200'">
              <i class="pi pi-info-circle mr-1"></i>
              El vehículo quedará disponible y la reserva pasará a estado <strong>Cancelada</strong>.
            </p>

            <div>
              <label class="field-label">Motivo de cancelación</label>
              <textarea
                v-model="motivo"
                rows="3"
                class="field-input w-full resize-none"
                :class="error ? 'error' : ''"
                placeholder="Indica por qué se cancela la reserva..."
              ></textarea>
              <p v-if="error" class="field-error">{{ error }}</p>
            </div>

            <div class="flex gap-3 pt-1">
              <button
                type="button"
                class="flex-1 py-2.5 rounded-xl font-bold text-sm border"
                :class="isDark ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'"
                :disabled="guardando"
                @click="$emit('cerrar')"
              >
                Volver
              </button>
              <button
                type="submit"
                class="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                style="background:#c0392b;"
                :disabled="guardando"
              >
                <i v-if="guardando" class="pi pi-spin pi-spinner mr-1"></i>
                Confirmar cancelación
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'
import { formatFecha, nombreVehiculo } from '@/utils/reservaFormatters'

const props = defineProps({
  visible: { type: Boolean, default: false },
  reserva: { type: Object, default: null },
  guardando: { type: Boolean, default: false },
})

const emit = defineEmits(['cerrar', 'confirmar'])

const { isDark } = useAppTheme()
const motivo = ref('')
const error = ref('')

watch(
  () => props.visible,
  (v) => {
    if (v) {
      motivo.value = ''
      error.value = ''
    }
  },
)

function confirmar() {
  error.value = ''
  if (!motivo.value.trim() || motivo.value.trim().length < 3) {
    error.value = 'El motivo debe tener al menos 3 caracteres'
    return
  }
  emit('confirmar', motivo.value.trim())
}
</script>

<style scoped>
.field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:0.5rem; }
.field-input { padding:0.75rem 1rem; border-radius:0.75rem; font-size:0.875rem; outline:none; border:1px solid #e5e7eb; width:100%; }
.field-input.error { border-color:#f87171; }
.field-error { font-size:0.75rem; color:#c0392b; margin-top:0.25rem; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
