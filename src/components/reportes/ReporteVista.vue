<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-gray-50'">

    <div v-if="cargando" class="flex flex-col items-center justify-center py-24 gap-3">
      <i class="pi pi-spin pi-spinner text-3xl" style="color:#c0392b;"></i>
      <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Generando reporte...</p>
    </div>

    <div v-else-if="error" class="rounded-2xl border p-8 text-center max-w-md mx-auto mt-12"
      :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
      <i class="pi pi-exclamation-triangle text-3xl mb-3 block" style="color:#c0392b;"></i>
      <p class="font-bold mb-2" :class="isDark ? 'text-gray-100' : 'text-gray-800'">No se pudo cargar el reporte</p>
      <p class="text-sm mb-4" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ error }}</p>
      <button type="button" class="px-4 py-2 rounded-xl text-sm font-bold text-white" style="background:#c0392b;" @click="$router.push({ name: 'reportes' })">
        Volver al formulario
      </button>
    </div>

    <div
      v-else
      id="reporte-imprimible"
      class="reporte-page p-6"
      :class="isDark ? 'bg-gray-950' : 'bg-gray-50'"
    >
      <!-- Header -->
      <div
        class="flex items-start justify-between mb-6 pb-4 border-b"
        :class="isDark ? 'border-gray-800' : 'border-gray-200'"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:#c0392b;">
            <i class="pi pi-car text-white text-lg"></i>
          </div>
          <div>
            <p class="text-xs uppercase tracking-widest font-medium" :class="isDark ? 'text-gray-500' : 'text-gray-400'">RentaCar</p>
            <h1 class="text-lg font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">Reporte de Rent A Car</h1>
            <p class="text-sm" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Resumen de desempeño</p>
          </div>
        </div>
        <div class="text-right">
          <div class="flex items-center gap-1 text-sm justify-end mb-3" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
            <i class="pi pi-calendar text-xs"></i>
            {{ formatFechaReporte(datos.periodo.fecha_inicio) }} — {{ formatFechaReporte(datos.periodo.fecha_fin) }}
          </div>
          <div class="flex gap-2 justify-end no-print">
            <button
              type="button"
              class="flex items-center gap-1 px-3 py-2 text-xs rounded-xl border transition-all font-semibold"
              :class="isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
              @click="$router.push({ name: 'reportes' })"
            >
              <i class="pi pi-arrow-left"></i> Volver
            </button>
            <button
              type="button"
              class="flex items-center gap-1 px-3 py-2 text-xs rounded-xl border transition-all font-semibold disabled:opacity-50"
              :class="isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
              :disabled="generandoPdf"
              @click="descargarPdf"
            >
              <i :class="generandoPdf ? 'pi pi-spin pi-spinner' : 'pi pi-file-pdf'"></i>
              {{ generandoPdf ? 'Generando...' : 'Descargar PDF' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Resumen ejecutivo -->
      <p class="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
        <i class="pi pi-th-large" style="color:#c0392b;"></i> Resumen ejecutivo
      </p>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div
          v-for="metrica in metricas"
          :key="metrica.label"
          class="rounded-xl p-4 border"
          :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
        >
          <p class="text-xs mb-1" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ metrica.label }}</p>
          <p class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ metrica.valor }}</p>
        </div>
      </div>

      <!-- Detalle por categoría -->
      <p class="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
        <i class="pi pi-list" style="color:#c0392b;"></i> Detalle de alquileres por categoría
      </p>
      <div
        class="rounded-xl overflow-hidden border mb-6"
        :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
      >
        <div v-if="!datos.categorias.length" class="px-5 py-10 text-center text-sm" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
          No hay alquileres en el periodo seleccionado.
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr :class="isDark ? 'bg-gray-800/60 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'">
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Categoría</th>
              <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Alquileres</th>
              <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Días alquilados</th>
              <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Ingresos (USD)</th>
              <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Ingreso prom. / alquiler</th>
              <th class="col-ocupacion text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Ocupación</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cat in datos.categorias"
              :key="cat.nombre"
              class="border-b transition-colors"
              :class="isDark ? 'border-gray-800 hover:bg-gray-800/40' : 'border-gray-100 hover:bg-gray-50'"
            >
              <td class="px-4 py-3" :class="isDark ? 'text-gray-200' : 'text-gray-700'">{{ cat.nombre }}</td>
              <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ cat.alquileres }}</td>
              <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ cat.dias }}</td>
              <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ formatMoney(cat.ingresos) }}</td>
              <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ formatMoney(cat.promedio) }}</td>
              <td class="col-ocupacion px-4 py-3 text-right" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ cat.ocupacion }}%</td>
            </tr>
            <tr :class="isDark ? 'bg-gray-800/60 border-t border-gray-700 font-semibold' : 'bg-gray-50 border-t border-gray-300 font-semibold'">
              <td class="px-4 py-3" :class="isDark ? 'text-gray-100' : 'text-gray-800'">Total</td>
              <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ datos.totales.alquileres }}</td>
              <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ datos.totales.dias }}</td>
              <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ formatMoney(datos.totales.ingresos) }}</td>
              <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ formatMoney(datos.totales.promedio) }}</td>
              <td class="col-ocupacion px-4 py-3 text-right" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ datos.totales.ocupacion }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Detalle de rentas individuales -->
      <p class="page-break text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
        <i class="pi pi-receipt" style="color:#c0392b;"></i> Detalle de rentas individuales
      </p>
      <div
        class="rounded-xl overflow-hidden border mb-6"
        :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
      >
        <div
          class="flex items-center justify-between px-4 py-3 border-b"
          :class="isDark ? 'border-gray-800' : 'border-gray-200'"
        >
          <span class="text-sm font-medium" :class="isDark ? 'text-gray-200' : 'text-gray-700'">Rentas del periodo</span>
          <span class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ datos.rentas.length }} registros</span>
        </div>
        <div v-if="!datos.rentas.length" class="px-5 py-10 text-center text-sm" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
          No hay contratos de renta en este periodo.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm min-w-[720px]">
            <thead>
              <tr :class="isDark ? 'bg-gray-800/60 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'">
                <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">N. renta</th>
                <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Cliente</th>
                <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Vehículo</th>
                <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Inicio</th>
                <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Fin</th>
                <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Días</th>
                <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Total</th>
                <th class="col-estado text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="renta in datos.rentas"
                :key="renta.numero"
                class="border-b transition-colors"
                :class="isDark ? 'border-gray-800 hover:bg-gray-800/40' : 'border-gray-100 hover:bg-gray-50'"
              >
                <td class="px-4 py-3 text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ renta.numero }}</td>
                <td class="px-4 py-3" :class="isDark ? 'text-gray-200' : 'text-gray-700'">{{ renta.cliente }}</td>
                <td class="px-4 py-3" :class="isDark ? 'text-gray-200' : 'text-gray-700'">{{ renta.vehiculo }}</td>
                <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-400' : 'text-gray-600'">{{ formatFechaCorta(renta.inicio) }}</td>
                <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-400' : 'text-gray-600'">{{ formatFechaCorta(renta.fin) }}</td>
                <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-200' : 'text-gray-700'">{{ renta.dias }}</td>
                <td class="px-4 py-3 text-right font-medium" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ formatMoney(renta.total) }}</td>
                <td class="col-estado px-4 py-3">
                  <span :class="['text-xs px-2 py-1 rounded-full font-medium', estadoClaseReporte(renta.estado, isDark)]">
                    {{ renta.estado }}
                  </span>
                </td>
              </tr>
              <tr :class="isDark ? 'bg-gray-800/60 border-t border-gray-700 font-semibold' : 'bg-gray-50 border-t border-gray-300 font-semibold'">
                <td colspan="6" class="px-4 py-3 text-right text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-500'">Total página</td>
                <td class="px-4 py-3 text-right" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ formatMoney(totalRentas) }}</td>
                <td class="col-estado"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import { useAppTheme } from '@/composables/useAppTheme'
import { abrirPdf } from '@/utils/pdfDownload'
import { formatMoney, formatFechaReporte, formatFechaCorta, estadoClaseReporte } from '@/utils/reporteFormatters'

const route = useRoute()
const { isDark } = useAppTheme()

const cargando = ref(true)
const generandoPdf = ref(false)
const error = ref('')
const datos = ref({
  periodo: { fecha_inicio: '', fecha_fin: '' },
  metricas: {},
  categorias: [],
  totales: { alquileres: 0, dias: 0, ingresos: 0, promedio: 0, ocupacion: 0 },
  rentas: [],
})

const metricas = computed(() => {
  const m = datos.value.metricas
  return [
    { label: 'Ingresos totales',            valor: formatMoney(m.ingresos_totales) },
    { label: 'Total alquileres',             valor: String(m.total_alquileres ?? 0) },
    { label: 'Flota disponible',             valor: String(m.flota_disponible ?? 0) },
    { label: 'Ingreso promedio / alquiler',  valor: formatMoney(m.ingreso_promedio) },
  ]
})

const totalRentas = computed(() =>
  datos.value.rentas.reduce((s, r) => s + Number(r.total || 0), 0),
)

async function cargarReporte() {
  const { fechaInicio, fechaFin } = route.query
  if (!fechaInicio || !fechaFin) {
    error.value = 'Faltan las fechas del periodo. Regresa al formulario y selecciona un rango.'
    cargando.value = false
    return
  }

  cargando.value = true
  error.value = 'La vista previa de desempeño fue reemplazada por reportes PDF desde el módulo de reportes.'
  cargando.value = false
}

async function descargarPdf() {
  if (cargando.value || error.value) return

  const { fechaInicio, fechaFin, estado } = route.query
  generandoPdf.value = true
  try {
    await abrirPdf('/admin/reportes/desempeno-general', {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      ...(estado ? { estado } : {}),
    })
  } catch (e) {
    await Swal.fire({
      icon: 'error',
      title: 'Error al generar PDF',
      text: e.response?.data?.message || 'No se pudo generar el reporte en PDF.',
      confirmButtonColor: '#c0392b',
      background: isDark.value ? '#1f2937' : '#fff',
      color: isDark.value ? '#f3f4f6' : '#111827',
    })
  } finally {
    generandoPdf.value = false
  }
}

onMounted(cargarReporte)
</script>
