<template>
  <div class="p-6 bg-white min-h-screen">

    <!-- Header -->
    <div class="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
          <i class="pi pi-car text-white text-lg"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-widest font-medium">RentaCar</p>
          <h1 class="text-lg font-semibold text-gray-800">Reporte de Rent A Car</h1>
          <p class="text-sm text-gray-400">Resumen de desempeno</p>
        </div>
      </div>
      <div class="text-right">
        <div class="flex items-center gap-1 text-sm text-gray-500 justify-end mb-3">
          <i class="pi pi-calendar text-xs"></i>
          {{ reporte.fechaInicio }} - {{ reporte.fechaFin }}
        </div>
        <div class="flex gap-2 justify-end no-print">
          <button @click="$router.back()"
            class="flex items-center gap-1 px-3 py-2 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
            <i class="pi pi-arrow-left"></i> Volver
          </button>
          <button @click="imprimir"
            class="flex items-center gap-1 px-3 py-2 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
            <i class="pi pi-print"></i> Imprimir
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen ejecutivo -->
    <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
      <i class="pi pi-th-large text-red-600"></i> Resumen ejecutivo
    </p>
    <div class="grid grid-cols-4 gap-3 mb-6">
      <div v-for="metrica in metricas" :key="metrica.label" class="bg-gray-50 rounded-xl p-4">
        <p class="text-xs text-gray-400 mb-1">{{ metrica.label }}</p>
        <p class="text-2xl font-semibold text-gray-800">{{ metrica.valor }}</p>
      </div>
    </div>

    <!-- Detalle por categoria -->
    <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
      <i class="pi pi-list text-red-600"></i> Detalle de alquileres por categoria
    </p>
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Alquileres</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dias alquilados</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ingresos (USD)</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ingreso prom. / alquiler</th>
            <th class="col-ocupacion text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ocupacion</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categorias" :key="cat.nombre"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 text-gray-700">{{ cat.nombre }}</td>
            <td class="px-4 py-3 text-right text-gray-700">{{ cat.alquileres }}</td>
            <td class="px-4 py-3 text-right text-gray-700">{{ cat.dias }}</td>
            <td class="px-4 py-3 text-right text-gray-700">{{ formatMoney(cat.ingresos) }}</td>
            <td class="px-4 py-3 text-right text-gray-700">{{ formatMoney(cat.promedio) }}</td>
            <td class="col-ocupacion px-4 py-3 text-right text-gray-700">{{ cat.ocupacion }}%</td>
          </tr>
          <tr class="bg-gray-50 border-t border-gray-300 font-semibold">
            <td class="px-4 py-3 text-gray-800">Total</td>
            <td class="px-4 py-3 text-right text-gray-800">{{ totales.alquileres }}</td>
            <td class="px-4 py-3 text-right text-gray-800">{{ totales.dias }}</td>
            <td class="px-4 py-3 text-right text-gray-800">{{ formatMoney(totales.ingresos) }}</td>
            <td class="px-4 py-3 text-right text-gray-800">{{ formatMoney(totales.promedio) }}</td>
            <td class="col-ocupacion px-4 py-3 text-right text-gray-800">{{ totales.ocupacion }}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detalle de rentas individuales -->
    <p class="page-break text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
      <i class="pi pi-receipt text-red-600"></i> Detalle de rentas individuales
    </p>
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span class="text-sm font-medium text-gray-700">Rentas del periodo</span>
        <span class="text-xs text-gray-400">{{ rentas.length }} registros</span>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">N. renta</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehiculo</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Inicio</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fin</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dias</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
            <th class="col-estado text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="renta in rentas" :key="renta.numero"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 text-gray-400 text-xs">{{ renta.numero }}</td>
            <td class="px-4 py-3 text-gray-700">{{ renta.cliente }}</td>
            <td class="px-4 py-3 text-gray-700">{{ renta.vehiculo }}</td>
            <td class="px-4 py-3 text-right text-gray-600">{{ renta.inicio }}</td>
            <td class="px-4 py-3 text-right text-gray-600">{{ renta.fin }}</td>
            <td class="px-4 py-3 text-right text-gray-700">{{ renta.dias }}</td>
            <td class="px-4 py-3 text-right font-medium text-gray-800">{{ formatMoney(renta.total) }}</td>
            <td class="col-estado px-4 py-3">
              <span :class="['text-xs px-2 py-1 rounded-full font-medium', estadoClase(renta.estado)]">
                {{ renta.estado }}
              </span>
            </td>
          </tr>
          <tr class="bg-gray-50 border-t border-gray-300 font-semibold">
            <td colspan="6" class="px-4 py-3 text-right text-gray-500 text-xs">Total pagina</td>
            <td class="px-4 py-3 text-right text-gray-800">{{ formatMoney(totalRentas) }}</td>
            <td class="col-estado"></td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const reporte = {
  fechaInicio: '01/05/2025',
  fechaFin: '31/05/2025',
}

const metricas = [
  { label: 'Ingresos totales',           valor: '$400.00' },
  { label: 'Total alquileres',            valor: '12'      },
  { label: 'Flota disponible',            valor: '10'      },
  { label: 'Ingreso promedio / alquiler', valor: '$33.33'  },
]

const categorias = [
  { nombre: 'Sedanes',    alquileres: 6, dias: 6, ingresos: 180, promedio: 30.00, ocupacion: 65 },
  { nombre: 'Camionetas', alquileres: 4, dias: 4, ingresos: 140, promedio: 35.00, ocupacion: 60 },
  { nombre: 'Microbus',   alquileres: 2, dias: 2, ingresos: 80,  promedio: 40.00, ocupacion: 50 },
]

const totales = computed(() => ({
  alquileres: categorias.reduce((s, c) => s + c.alquileres, 0),
  dias:       categorias.reduce((s, c) => s + c.dias, 0),
  ingresos:   categorias.reduce((s, c) => s + c.ingresos, 0),
  promedio:   +(categorias.reduce((s, c) => s + c.ingresos, 0) / categorias.reduce((s, c) => s + c.alquileres, 0)).toFixed(2),
  ocupacion:  60,
}))

const rentas = [
  { numero: '#R-00012', cliente: 'Carlos Mejia',  vehiculo: 'Toyota Corolla',  inicio: '28 may', fin: '29 may', dias: 1, total: 30, estado: 'Activa'     },
  { numero: '#R-00011', cliente: 'Laura Rivas',    vehiculo: 'Mitsubishi L200', inicio: '25 may', fin: '26 may', dias: 1, total: 35, estado: 'Finalizada' },
  { numero: '#R-00010', cliente: 'Jose Morales',   vehiculo: 'Microbus Toyota', inicio: '20 may', fin: '21 may', dias: 1, total: 40, estado: 'Finalizada' },
  { numero: '#R-00009', cliente: 'Ana Portillo',   vehiculo: 'Honda Civic',     inicio: '15 may', fin: '16 may', dias: 1, total: 30, estado: 'Finalizada' },
  { numero: '#R-00008', cliente: 'Roberto Garcia', vehiculo: 'Nissan Frontier', inicio: '10 may', fin: '11 may', dias: 1, total: 35, estado: 'Cancelada'  },
]

const totalRentas = computed(() => rentas.reduce((s, r) => s + r.total, 0))

function formatMoney(val) {
  return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function estadoClase(estado) {
  const clases = {
    'Activa':     'bg-green-100 text-green-700',
    'Finalizada': 'bg-blue-100 text-blue-700',
    'Pendiente':  'bg-yellow-100 text-yellow-700',
    'Cancelada':  'bg-red-100 text-red-600',
  }
  return clases[estado] ?? 'bg-gray-100 text-gray-600'
}

function imprimir() { window.print() }
</script>