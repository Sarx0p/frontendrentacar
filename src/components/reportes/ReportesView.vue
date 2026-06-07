<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-gray-50'">

    <div class="flex items-center gap-3 mb-6">
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center border"
        :class="isDark ? 'bg-red-950/40 border-red-900/50' : 'bg-red-50 border-red-100'"
      >
        <i class="pi pi-file text-lg" style="color:#c0392b;"></i>
      </div>
      <div>
        <h1 class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">Generar reporte</h1>
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Renta de vehículos</p>
      </div>
    </div>

    <div
      class="rounded-2xl border shadow-sm p-5 mb-4"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <p class="text-xs font-semibold uppercase tracking-widest mb-3" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Periodo</p>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="p in periodos"
          :key="p.value"
          type="button"
          @click="seleccionarPeriodo(p.value)"
          class="px-4 py-2 rounded-full text-sm border transition-all font-semibold"
          :class="form.periodo === p.value
            ? 'text-white border-transparent'
            : (isDark ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-750' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50')"
          :style="form.periodo === p.value ? 'background:#c0392b;border-color:#c0392b;' : ''"
        >
          {{ p.label }}
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Fecha inicio</label>
          <input
            v-model="form.fechaInicio"
            type="date"
            class="rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-red-300/40"
            :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-700'"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Fecha fin</label>
          <input
            v-model="form.fechaFin"
            type="date"
            class="rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-red-300/40"
            :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-700'"
          />
        </div>
      </div>
    </div>

    <div
      class="rounded-2xl border shadow-sm p-5 mb-4"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <p class="text-xs font-semibold uppercase tracking-widest mb-3" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Filtros</p>
      <div class="flex flex-col gap-1">
        <label class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Estado de renta</label>
        <select
          v-model="form.estado"
          class="rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-red-300/40"
          :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-700'"
        >
          <option value="">Todos</option>
          <option value="activa">Activa</option>
          <option value="finalizada">Finalizada</option>
          <option value="cancelada">Cancelada</option>
          <option value="pendiente">Pendiente</option>
        </select>
      </div>
    </div>

    <div class="flex justify-end mt-6">
      <button
        type="button"
        :disabled="generando"
        class="flex items-center gap-2 px-5 py-2.5 text-sm text-white rounded-xl transition-all font-bold disabled:opacity-60 hover:opacity-90"
        style="background:#c0392b;"
        @click="generarReporte"
      >
        <i v-if="generando" class="pi pi-spin pi-spinner text-xs"></i>
        <i v-else class="pi pi-file-pdf text-xs"></i>
        Generar reporte
      </button>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useAppTheme } from '@/composables/useAppTheme'

const router = useRouter()
const { isDark } = useAppTheme()
const generando = ref(false)

const form = reactive({
  periodo: 'mes',
  fechaInicio: '',
  fechaFin: '',
  estado: '',
})

const periodos = [
  { value: 'personalizado', label: 'Personalizado' },
  { value: 'mes',           label: 'Este mes' },
  { value: 'trimestral',    label: 'Trimestral' },
  { value: 'anual',         label: 'Anual' },
]

function seleccionarPeriodo(valor) {
  form.periodo = valor
  const hoy = new Date()
  if (valor === 'mes') {
    form.fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
    form.fechaFin = hoy.toISOString().split('T')[0]
  } else if (valor === 'trimestral') {
    const inicio = new Date(hoy)
    inicio.setMonth(hoy.getMonth() - 3)
    form.fechaInicio = inicio.toISOString().split('T')[0]
    form.fechaFin = hoy.toISOString().split('T')[0]
  } else if (valor === 'anual') {
    form.fechaInicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0]
    form.fechaFin = hoy.toISOString().split('T')[0]
  }
}

async function generarReporte() {
  if (!form.fechaInicio || !form.fechaFin) {
    await Swal.fire({
      icon: 'warning',
      title: 'Fechas requeridas',
      text: 'Selecciona el periodo del reporte.',
      confirmButtonColor: '#c0392b',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
    return
  }
  if (form.fechaFin < form.fechaInicio) {
    await Swal.fire({
      icon: 'warning',
      title: 'Periodo inválido',
      text: 'La fecha fin debe ser igual o posterior a la fecha inicio.',
      confirmButtonColor: '#c0392b',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
    return
  }

  generando.value = true
  router.push({
    name: 'reportes-vista',
    query: {
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      ...(form.estado ? { estado: form.estado } : {}),
    },
  })
}

onMounted(() => seleccionarPeriodo('mes'))
</script>
