<template>
  <div class="p-6 bg-white min-h-screen">

    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center">
        <i class="pi pi-file text-red-600 text-lg"></i>
      </div>
      <div>
        <h1 class="text-lg font-semibold text-gray-800">Generar reporte</h1>
        <p class="text-sm text-gray-400">Renta de vehiculos</p>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Periodo</p>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="p in periodos"
          :key="p.value"
          @click="seleccionarPeriodo(p.value)"
          :class="[
            'px-4 py-2 rounded-full text-sm border transition-all',
            form.periodo === p.value
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          ]"
        >
          {{ p.label }}
        </button>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-500">Fecha inicio</label>
          <input v-model="form.fechaInicio" type="date"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-500">Fecha fin</label>
          <input v-model="form.fechaFin" type="date"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Filtros</p>
      <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-500">Estado de renta</label>
        <select v-model="form.estado"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 bg-white">
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
        @click="generarReporte"
        class="flex items-center gap-2 px-5 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
      >
        <i class="pi pi-file-pdf text-xs"></i> Generar reporte PDF
      </button>
    </div>

  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  periodo: 'personalizado',
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

function generarReporte() {
  router.push({ name: 'reportes-vista' })
}
</script>