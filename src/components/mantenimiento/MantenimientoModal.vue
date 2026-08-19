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
          <div class="flex items-center justify-between px-6 py-5 border-b" :class="isDark ? 'border-gray-800' : 'border-gray-100'">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="isDark ? 'bg-red-900/60' : 'bg-red-50'">
                <i class="pi pi-wrench text-base" :style="isDark ? 'color:#f0a500' : 'color:#c0392b;'"></i>
              </div>
              <div>
                <p class="font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">
                  {{ modoEdicion ? 'Editar mantenimiento' : 'Nuevo mantenimiento' }}
                </p>
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                  {{ modoEdicion ? 'Actualiza el servicio registrado' : 'Registra un mantenimiento activo para el vehiculo' }}
                </p>
              </div>
            </div>
            <button type="button" class="w-8 h-8 rounded-lg border flex items-center justify-center" @click="$emit('cerrar')">
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>

          <form class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto" @submit.prevent="handleGuardar">
            <div>
              <label class="field-label">Vehiculo</label>
              <select
                v-model="form.vehiculo_id"
                class="field-input w-full"
                :class="errors.vehiculo_id ? 'error' : ''"
                :disabled="modoEdicion"
              >
                <option value="">Selecciona un vehiculo disponible...</option>
                <option v-for="v in vehiculosElegibles" :key="v.id" :value="v.id">
                  {{ nombreVehiculo(v) }} - {{ v.placa }}
                </option>
              </select>
              <p v-if="errors.vehiculo_id" class="field-error">{{ errors.vehiculo_id }}</p>
              <!-- <p v-if="!modoEdicion" class="field-help">
                Al registrar el mantenimiento, el vehiculo pasara a estado Mantenimiento automaticamente.
              </p> -->
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Tipo</label>
                <select v-model="form.tipo_mantenimiento" class="field-input w-full">
                  <option value="PREVENTIVO">Preventivo</option>
                  <option value="CORRECTIVO">Correctivo</option>
                </select>
              </div>
              <div v-if="modoEdicion">
                <label class="field-label">Estado</label>
                <select v-model="form.estado" class="field-input w-full">
                  <option value="ACTIVO">Activo</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>

            <div>
              <p v-if="!modoEdicion" class="field-help">
                La fecha se registrara automaticamente con la hora del sistema.
              </p>
              <p v-else class="field-help">
                Fecha registrada: {{ fechaRegistrada }}
              </p>
            </div>

            <div>
              <label class="field-label">Costo ($)</label>
              <input v-model="form.costo" type="number" min="0" step="0.01" class="field-input w-full" :class="errors.costo ? 'error' : ''" />
              <p v-if="errors.costo" class="field-error">{{ errors.costo }}</p>
            </div>

            <div>
              <label class="field-label">Lugar</label>
              <input v-model="form.lugar" type="text" class="field-input w-full" :class="errors.lugar ? 'error' : ''" placeholder="Taller, sucursal o lugar del servicio" />
              <p v-if="errors.lugar" class="field-error">{{ errors.lugar }}</p>
            </div>

            <div>
              <label class="field-label">Descripcion</label>
              <textarea v-model="form.descripcion" rows="3" class="field-input w-full resize-none" placeholder="Detalle del trabajo realizado o requerido..."></textarea>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" class="flex-1 py-2.5 rounded-xl font-bold text-sm border" @click="$emit('cerrar')">
                Cancelar
              </button>
              <button type="submit" class="flex-1 py-2.5 rounded-xl font-bold text-sm text-white" style="background:#c0392b;" :disabled="guardando">
                <i v-if="guardando" class="pi pi-spin pi-spinner mr-1"></i>
                {{ modoEdicion ? 'Guardar cambios' : 'Registrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'
import { nombreVehiculo } from '@/utils/reservaFormatters'

const props = defineProps({
  visible: { type: Boolean, default: false },
  modoEdicion: { type: Boolean, default: false },
  mantenimiento: { type: Object, default: null },
  vehiculos: { type: Array, default: () => [] },
  guardando: { type: Boolean, default: false },
})

const emit = defineEmits(['cerrar', 'guardar'])

const { isDark } = useAppTheme()

const form = ref(formularioVacio())
const errors = ref({})

const fechaRegistrada = computed(() => {
  if (!props.mantenimiento?.fecha) return 'sin fecha registrada'
  return String(props.mantenimiento.fecha).slice(0, 10)
})

const vehiculosElegibles = computed(() => {
  const idEdicion = props.modoEdicion ? props.mantenimiento?.vehiculo_id : null

  return props.vehiculos.filter((v) => {
    if (idEdicion && v.id === idEdicion) return true
    return v.estado === 'DISPONIBLE'
  })
})

watch(
  () => [props.visible, props.mantenimiento],
  () => {
    if (!props.visible) return
    errors.value = {}
    if (props.modoEdicion && props.mantenimiento) {
      form.value = {
        vehiculo_id: props.mantenimiento.vehiculo_id ?? '',
        tipo_mantenimiento: props.mantenimiento.tipo_mantenimiento ?? 'PREVENTIVO',
        descripcion: props.mantenimiento.descripcion ?? '',
        costo: props.mantenimiento.costo ?? '',
        lugar: props.mantenimiento.lugar ?? '',
        estado: props.mantenimiento.estado ?? 'ACTIVO',
      }
    } else {
      form.value = formularioVacio()
    }
  },
)

function formularioVacio() {
  return {
    vehiculo_id: '',
    tipo_mantenimiento: 'PREVENTIVO',
    descripcion: '',
    costo: '',
    lugar: '',
    estado: 'ACTIVO',
  }
}

function validar() {
  errors.value = {}
  if (!form.value.vehiculo_id) errors.value.vehiculo_id = 'Selecciona un vehiculo'
  if (form.value.costo === '' || Number(form.value.costo) < 0) errors.value.costo = 'Ingresa un costo valido'
  if (!form.value.lugar?.trim()) errors.value.lugar = 'Requerido'
  return Object.keys(errors.value).length === 0
}

function handleGuardar() {
  if (!validar()) return
  const payload = {
    vehiculo_id: form.value.vehiculo_id,
    tipo_mantenimiento: form.value.tipo_mantenimiento,
    descripcion: form.value.descripcion?.trim() || null,
    costo: Number(form.value.costo),
    lugar: form.value.lugar.trim(),
  }
  if (props.modoEdicion) {
    payload.estado = form.value.estado
  }
  emit('guardar', payload)
}
</script>

<style scoped>
.field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:0.35rem; }
.modal-panel-light .field-label { color:#4b5563; }
.modal-panel-dark .field-label { color:#9ca3af; }
.field-input { padding:0.65rem 0.75rem; border-radius:0.75rem; font-size:0.875rem; outline:none; border:1px solid #e5e7eb; }
.modal-panel-dark .field-input { border-color:#4b5563; background:#1f2937; color:#f3f4f6; }
.field-input.error { border-color:#f87171; }
.field-help { font-size:0.72rem; color:#6b7280; margin-top:0.35rem; }
.field-error { font-size:0.75rem; color:#c0392b; margin-top:0.25rem; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
