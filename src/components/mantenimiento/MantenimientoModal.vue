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
                  {{ modoEdicion ? 'Actualiza los datos del servicio' : 'Registra un mantenimiento al vehículo' }}
                </p>
              </div>
            </div>
            <button type="button" class="w-8 h-8 rounded-lg border flex items-center justify-center" @click="$emit('cerrar')">
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>

          <form class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto" @submit.prevent="handleGuardar">
            <div>
              <label class="field-label">Vehículo</label>
              <select v-model="form.vehiculo_id" class="field-input w-full" :class="errors.vehiculo_id ? 'error' : ''">
                <option value="">Selecciona un vehículo...</option>
                <option v-for="v in vehiculosElegibles" :key="v.id" :value="v.id">
                  {{ nombreVehiculo(v) }} — {{ v.placa }}
                </option>
              </select>
              <p v-if="errors.vehiculo_id" class="field-error">{{ errors.vehiculo_id }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Tipo</label>
                <select v-model="form.tipo_mantenimiento" class="field-input w-full">
                  <option value="PREVENTIVO">Preventivo</option>
                  <option value="CORRECTIVO">Correctivo</option>
                </select>
              </div>
              <div>
                <label class="field-label">Estado</label>
                <select v-model="form.estado" class="field-input w-full">
                  <option value="PROGRAMADO">Programado</option>
                  <option value="EN PROCESO">En proceso</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Fecha inicio</label>
                <input v-model="form.fecha_inicio" type="date" class="field-input w-full" :class="errors.fecha_inicio ? 'error' : ''" />
                <p v-if="errors.fecha_inicio" class="field-error">{{ errors.fecha_inicio }}</p>
              </div>
              <div>
                <label class="field-label">Fecha fin</label>
                <input v-model="form.fecha_fin" type="date" class="field-input w-full" :min="form.fecha_inicio" :class="errors.fecha_fin ? 'error' : ''" />
                <p v-if="errors.fecha_fin" class="field-error">{{ errors.fecha_fin }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Costo ($)</label>
                <input v-model="form.costo" type="number" min="0" step="0.01" class="field-input w-full" :class="errors.costo ? 'error' : ''" />
                <p v-if="errors.costo" class="field-error">{{ errors.costo }}</p>
              </div>
              <div>
                <label class="field-label">Proveedor</label>
                <input v-model="form.proveedor" type="text" class="field-input w-full" :class="errors.proveedor ? 'error' : ''" placeholder="Taller o proveedor" />
                <p v-if="errors.proveedor" class="field-error">{{ errors.proveedor }}</p>
              </div>
            </div>

            <div>
              <label class="field-label">Descripción</label>
              <textarea v-model="form.descripcion" rows="3" class="field-input w-full resize-none" placeholder="Detalle del trabajo realizado o programado..."></textarea>
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

const vehiculosElegibles = computed(() => {
  const bloqueados = ['RENTADO', 'MANTENIMIENTO']
  const idEdicion = props.modoEdicion ? props.mantenimiento?.vehiculo_id : null

  return props.vehiculos.filter((v) => {
    if (idEdicion && v.id === idEdicion) return true
    return !bloqueados.includes(v.estado)
  })
})

watch(
  () => [props.visible, props.mantenimiento],
  () => {
    if (!props.visible) return
    errors.value = {}
    if (props.modoEdicion && props.mantenimiento) {
      form.value = {
        vehiculo_id:        props.mantenimiento.vehiculo_id ?? '',
        tipo_mantenimiento: props.mantenimiento.tipo_mantenimiento ?? 'PREVENTIVO',
        descripcion:        props.mantenimiento.descripcion ?? '',
        costo:              props.mantenimiento.costo ?? '',
        fecha_inicio:       toInputDate(props.mantenimiento.fecha_inicio),
        fecha_fin:          toInputDate(props.mantenimiento.fecha_fin),
        proveedor:          props.mantenimiento.proveedor ?? '',
        estado:             props.mantenimiento.estado ?? 'PROGRAMADO',
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
    fecha_inicio: '',
    fecha_fin: '',
    proveedor: '',
    estado: 'PROGRAMADO',
  }
}

function toInputDate(fecha) {
  if (!fecha) return ''
  return String(fecha).slice(0, 10)
}

function validar() {
  errors.value = {}
  if (!form.value.vehiculo_id) errors.value.vehiculo_id = 'Selecciona un vehículo'
  if (!form.value.fecha_inicio) errors.value.fecha_inicio = 'Requerido'
  if (form.value.fecha_fin && form.value.fecha_fin < form.value.fecha_inicio) {
    errors.value.fecha_fin = 'Debe ser posterior al inicio'
  }
  if (form.value.costo === '' || Number(form.value.costo) < 0) errors.value.costo = 'Ingresa un costo válido'
  if (!form.value.proveedor?.trim()) errors.value.proveedor = 'Requerido'
  return Object.keys(errors.value).length === 0
}

function handleGuardar() {
  if (!validar()) return
  emit('guardar', {
    vehiculo_id:        form.value.vehiculo_id,
    tipo_mantenimiento: form.value.tipo_mantenimiento,
    descripcion:        form.value.descripcion?.trim() || null,
    costo:              Number(form.value.costo),
    fecha_inicio:       form.value.fecha_inicio,
    fecha_fin:          form.value.fecha_fin || null,
    proveedor:          form.value.proveedor.trim(),
    estado:             form.value.estado,
  })
}
</script>

<style scoped>
.field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:0.35rem; }
.modal-panel-light .field-label { color:#4b5563; }
.modal-panel-dark .field-label { color:#9ca3af; }
.field-input { padding:0.65rem 0.75rem; border-radius:0.75rem; font-size:0.875rem; outline:none; border:1px solid #e5e7eb; }
.modal-panel-dark .field-input { border-color:#4b5563; background:#1f2937; color:#f3f4f6; }
.field-input.error { border-color:#f87171; }
.field-error { font-size:0.75rem; color:#c0392b; margin-top:0.25rem; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
