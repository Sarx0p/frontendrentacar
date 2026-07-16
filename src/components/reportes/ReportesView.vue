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
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Selecciona el tipo de reporte a generar</p>
      </div>
    </div>

    <!-- Tipo de reporte -->
    <div
      class="rounded-2xl border shadow-sm p-4 mb-4"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <p class="text-xs font-semibold uppercase tracking-widest mb-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Tipo de reporte</p>
      <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
        <select
          v-model="form.tipo"
          class="w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none"
          :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
        >
          <optgroup v-for="grupo in gruposReporte" :key="grupo.id" :label="grupo.titulo">
            <option v-for="tipo in grupo.items" :key="tipo.value" :value="tipo.value">
              {{ tipo.label }}
            </option>
          </optgroup>
        </select>
        <span
          class="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap"
          :class="isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'"
        >
          {{ tipoActual?.modo === 'vista' ? 'Vista en pantalla' : 'Exportación PDF' }}
        </span>
      </div>
      <p class="text-xs mt-2" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
        {{ tipoActual?.descripcion }}
      </p>
    </div>

    <!-- Periodo -->
    <div
      v-if="tipoActual?.needsPeriod"
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
            : (isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-600 border-gray-300')"
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
            class="rounded-xl px-3 py-2.5 text-sm border focus:outline-none"
            :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Fecha fin</label>
          <input
            v-model="form.fechaFin"
            type="date"
            class="rounded-xl px-3 py-2.5 text-sm border focus:outline-none"
            :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
          />
        </div>
      </div>
    </div>

    <!-- Filtro estado (solo desempeño) -->
    <div
      v-if="tipoActual?.needsEstado"
      class="rounded-2xl border shadow-sm p-5 mb-4"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <p class="text-xs font-semibold uppercase tracking-widest mb-3" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Filtros</p>
      <div class="flex flex-col gap-1">
        <label class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Estado de renta</label>
        <select
          v-model="form.estado"
          class="rounded-xl px-3 py-2.5 text-sm border focus:outline-none"
          :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
        >
          <option value="">Todos</option>
          <option value="activa">Activa</option>
          <option value="finalizada">Finalizada</option>
          <option value="cancelada">Cancelada</option>
          <option value="pendiente">Pendiente</option>
        </select>
      </div>
    </div>

    <!-- Cliente (historial) -->
    <div
      v-if="tipoActual?.needsCliente"
      class="rounded-2xl border shadow-sm p-5 mb-4"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <p class="text-xs font-semibold uppercase tracking-widest mb-3" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Cliente</p>
      <select
        v-model="form.clienteId"
        class="w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none"
        :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
      >
        <option value="">Selecciona un cliente...</option>
        <option v-for="c in clientesStore.clientes" :key="c.id" :value="c.id">
          {{ c.nombre }} — DUI: {{ c.dui }}
        </option>
      </select>
    </div>

    <!-- Licencias (días) -->
    <div
      v-if="tipoActual?.needsDias"
      class="rounded-2xl border shadow-sm p-5 mb-4"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
    >
      <p class="text-xs font-semibold uppercase tracking-widest mb-3" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Días por vencer</p>
      <input
        v-model.number="form.dias"
        type="number"
        min="1"
        max="365"
        class="w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none"
        :class="isDark ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50'"
      />
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
        {{ tipoActual?.modo === 'vista' ? 'Generar reporte' : 'Descargar PDF' }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useAppTheme } from '@/composables/useAppTheme'
import { useClientesStore } from '@/stores/clientes'
import { abrirPdf } from '@/utils/pdfDownload'

const router = useRouter()
const { isDark } = useAppTheme()
const clientesStore = useClientesStore()
const generando = ref(false)

const form = reactive({
  tipo: 'desempeno',
  periodo: 'mes',
  fechaInicio: '',
  fechaFin: '',
  estado: '',
  clienteId: '',
  dias: 30,
})

const tiposReporte = [
  {
    value: 'desempeno',
    label: 'Desempeño general',
    descripcion: 'Resumen de rentas, ingresos y ocupación.',
    grupo: 'general',
    modo: 'vista',
    needsPeriod: true,
    needsEstado: true,
    endpoint: null,
  },
  {
    value: 'ingresos-por-vehiculo',
    label: 'Ingresos por vehículo',
    descripcion: 'Pagos confirmados agrupados por vehículo.',
    grupo: 'propietarios',
    modo: 'pdf',
    needsPeriod: true,
    endpoint: '/admin/reportes/ingresos-por-vehiculo',
  },
  {
    value: 'gastos-por-vehiculo',
    label: 'Gastos por vehículo',
    descripcion: 'Mantenimientos agrupados por vehículo.',
    grupo: 'propietarios',
    modo: 'pdf',
    needsPeriod: true,
    endpoint: '/admin/reportes/gastos-por-vehiculo',
  },
  {
    value: 'neto-por-vehiculo',
    label: 'Resultado neto por vehículo',
    descripcion: 'Ingresos menos gastos por vehículo.',
    grupo: 'propietarios',
    modo: 'pdf',
    needsPeriod: true,
    endpoint: '/admin/reportes/neto-por-vehiculo',
  },
  {
    value: 'saldos-pendientes',
    label: 'Saldos pendientes',
    descripcion: 'Contratos activos con pago pendiente o parcial.',
    grupo: 'operativos',
    modo: 'pdf',
    needsPeriod: false,
    endpoint: '/admin/reportes/saldos-pendientes',
  },
  {
    value: 'historial-cliente',
    label: 'Historial de cliente',
    descripcion: 'Reservas, contratos, pagos e incidencias.',
    grupo: 'operativos',
    modo: 'pdf',
    needsPeriod: false,
    needsCliente: true,
    endpoint: '/admin/reportes/historial-cliente',
  },
  {
    value: 'ingresos',
    label: 'Detalle de ingresos',
    descripcion: 'Listado de pagos confirmados.',
    grupo: 'otros',
    modo: 'pdf',
    needsPeriod: true,
    endpoint: '/admin/reportes/ingresos',
  },
  {
    value: 'estado-flota',
    label: 'Estado de flota',
    descripcion: 'Resumen del estado de los vehículos.',
    grupo: 'otros',
    modo: 'pdf',
    needsPeriod: false,
    endpoint: '/admin/reportes/estado-flota',
  },
  {
    value: 'licencias-por-vencer',
    label: 'Licencias por vencer',
    descripcion: 'Clientes con licencia próxima a vencer.',
    grupo: 'otros',
    modo: 'pdf',
    needsPeriod: false,
    needsDias: true,
    endpoint: '/admin/reportes/licencias-por-vencer',
  },
  {
    value: 'reservas-canceladas',
    label: 'Reservas canceladas',
    descripcion: 'Historial de cancelaciones.',
    grupo: 'otros',
    modo: 'pdf',
    needsPeriod: true,
    endpoint: '/admin/reportes/reservas-canceladas',
  },
]

const gruposReporte = computed(() => [
  {
    id: 'general',
    titulo: 'General',
    color: '#c0392b',
    items: tiposReporte.filter((t) => t.grupo === 'general'),
  },
  {
    id: 'propietarios',
    titulo: 'Propietarios / contabilidad',
    color: '#922b21',
    items: tiposReporte.filter((t) => t.grupo === 'propietarios'),
  },
  {
    id: 'operativos',
    titulo: 'Operativos',
    color: '#f0a500',
    items: tiposReporte.filter((t) => t.grupo === 'operativos'),
  },
  {
    id: 'otros',
    titulo: 'Otros reportes',
    color: '#6b7280',
    items: tiposReporte.filter((t) => t.grupo === 'otros'),
  },
])

const tipoActual = computed(() => tiposReporte.find((t) => t.value === form.tipo))

const periodos = [
  { value: 'personalizado', label: 'Personalizado' },
  { value: 'mes', label: 'Este mes' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'anual', label: 'Anual' },
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

async function alerta(tipo, titulo, texto) {
  await Swal.fire({
    icon: tipo,
    title: titulo,
    text: texto,
    confirmButtonColor: '#c0392b',
    background: isDark.value ? '#1f2937' : '#fff',
    color: isDark.value ? '#f3f4f6' : '#111827',
  })
}

async function generarReporte() {
  const tipo = tipoActual.value
  if (!tipo) return

  if (tipo.needsPeriod && (!form.fechaInicio || !form.fechaFin)) {
    await alerta('warning', 'Fechas requeridas', 'Selecciona el periodo del reporte.')
    return
  }
  if (tipo.needsPeriod && form.fechaFin < form.fechaInicio) {
    await alerta('warning', 'Periodo inválido', 'La fecha fin debe ser igual o posterior a la fecha inicio.')
    return
  }
  if (tipo.needsCliente && !form.clienteId) {
    await alerta('warning', 'Cliente requerido', 'Selecciona el cliente para el historial.')
    return
  }

  if (tipo.modo === 'vista') {
    router.push({
      name: 'reportes-vista',
      query: {
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        ...(form.estado ? { estado: form.estado } : {}),
      },
    })
    return
  }

  generando.value = true
  try {
    const params = {}
    if (tipo.needsPeriod) {
      params.fecha_inicio = form.fechaInicio
      params.fecha_fin = form.fechaFin
    }
    if (tipo.needsDias) {
      params.dias = form.dias
    }

    let url = tipo.endpoint
    if (tipo.needsCliente) {
      url = `${tipo.endpoint}/${form.clienteId}`
    }

    await abrirPdf(url, params)
  } catch (e) {
    await alerta('error', 'No se pudo generar', e.message || 'Intenta de nuevo.')
  } finally {
    generando.value = false
  }
}

onMounted(async () => {
  seleccionarPeriodo('mes')
  if (!clientesStore.clientes.length) {
    await clientesStore.fetchClientes()
  }
})
</script>
