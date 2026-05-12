<template>
  <div class="min-h-screen bg-gray-50" style="font-family: 'Sora', sans-serif;">

    <!-- Page header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p class="text-sm text-gray-500 mt-0.5">Bienvenido de nuevo, <span class="font-semibold" style="color:#c0392b;">Usuario</span> — aquí está el resumen de hoy.</p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <i class="pi pi-calendar text-gray-400"></i>
          {{ today }}
        </div>
      </div>
    </div>

    <!-- ── STAT CARDS ── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        v-bind="stat"
      />
    </div>

    <!-- ── MIDDLE ROW: mini charts + resumen operativo ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

      <!-- Ingresos del mes -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Ingresos del mes</p>
        <p class="text-xs text-gray-400 mb-4">ventas este mes</p>
        <MiniLineChart :data="incomeData" color="#c0392b" />
        <div class="flex items-center gap-1 mt-3 text-xs font-semibold" style="color:#22c55e;">
        </div>
      </div>

      <!-- Reservas activas -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Reservas activas</p>
        <p class="text-xs text-gray-400 mb-4">ingresos por reservas</p>
        <MiniLineChart :data="reservasData" color="#f0a500" />
        <div class="flex items-center gap-1 mt-3 text-xs font-semibold" style="color:#f0a500;">
        </div>
      </div>

      <!-- Resumen operativo tipo bandwidth -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-chart-pie text-sm" style="color:#c0392b;"></i>
            <p class="text-xs font-bold uppercase tracking-widest" style="color:#c0392b;">Resumen operativo</p>
          </div>
          <div class="flex gap-1">
            <button
              v-for="tab in ['Hoy','Semana']"
              :key="tab"
              @click="activeTab = tab"
              class="text-xs font-bold px-3 py-1 rounded-full transition-all"
              :style="activeTab === tab
                ? 'background:#c0392b; color:white;'
                : 'color:#9ca3af;'"
            >{{ tab }}</button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-2xl font-extrabold text-gray-800">{{ activeTab === 'Hoy' ? '5' : '34' }}</p>
            <p class="text-xs text-gray-400">Nuevas reservas</p>
          </div>
          <div>
            <p class="text-2xl font-extrabold text-gray-800">{{ activeTab === 'Hoy' ? '$1,240' : '$8,760' }}</p>
            <p class="text-xs text-gray-400">Ingresos</p>
          </div>
        </div>

        <div class="mt-4 space-y-3">
          <ProgressRow label="Flota disponible"  :value="72" color="#c0392b" />
          <ProgressRow label="Contratos activos" :value="61" color="#f0a500" />
          <ProgressRow label="Pagos al día"       :value="88" color="#22c55e" />
          <ProgressRow label="Mantenimientos"     :value="35" color="#3b82f6" />
        </div>
      </div>
    </div>

    <!-- ── BOTTOM ROW: actividad reciente + vehículos top ── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <!-- Actividad reciente -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-extrabold text-gray-800">Actividad reciente</p>
          <button class="text-xs font-semibold hover:underline" style="color:#c0392b;">Ver todo</button>
        </div>
        <div class="space-y-3">
          <ActivityRow
            v-for="item in activity"
            :key="item.id"
            v-bind="item"
          />
        </div>
      </div>

      <!-- Vehículos más rentados -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-extrabold text-gray-800">Vehículos más rentados</p>
          <button class="text-xs font-semibold hover:underline" style="color:#c0392b;">Ver flota</button>
        </div>
        <div class="space-y-3">
          <VehicleRow
            v-for="v in topVehicles"
            :key="v.plate"
            v-bind="v"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ── Sub-components inline ────────────────────────────────────

// StatCard
const StatCard = {
  props: ['label', 'sub', 'value', 'color', 'icon', 'progress', 'progressLabel'],
  template: `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-gray-400">{{ label }}</p>
          <p class="text-[11px] text-gray-400 mt-0.5">{{ sub }}</p>
        </div>
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" :style="'background:' + color + '18'">
          <i :class="['pi', icon]" :style="'color:' + color" class="text-base"></i>
        </div>
      </div>
      <p class="text-3xl font-extrabold mb-3" :style="'color:' + color">{{ value }}</p>
      <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-700" :style="'width:' + progress + '%; background:' + color"></div>
      </div>
      <div class="flex justify-between mt-1.5 text-[11px] text-gray-400">
        <span>{{ progressLabel }}</span>
        <span>100%</span>
      </div>
    </div>
  `
}

// MiniLineChart (SVG sparkline)
const MiniLineChart = {
  props: ['data', 'color'],
  computed: {
    path() {
      const d = this.data
      const max = Math.max(...d), min = Math.min(...d)
      const w = 260, h = 48
      const pts = d.map((v, i) => {
        const x = (i / (d.length - 1)) * w
        const y = h - ((v - min) / (max - min || 1)) * h
        return `${x},${y}`
      })
      return `M${pts.join(' L')}`
    }
  },
  template: `
    <svg viewBox="0 0 260 48" class="w-full" style="height:48px;">
      <path :d="path" fill="none" :stroke="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path :d="path + ' L260,48 L0,48 Z'" :fill="color" fill-opacity="0.08"/>
    </svg>
  `
}

// ProgressRow
const ProgressRow = {
  props: ['label', 'value', 'color'],
  template: `
    <div>
      <div class="flex justify-between text-xs mb-1">
        <span class="font-semibold text-gray-600">{{ label }}</span>
        <span class="font-bold" :style="'color:' + color">{{ value }}%</span>
      </div>
      <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-700" :style="'width:' + value + '%; background:' + color"></div>
      </div>
    </div>
  `
}

// ActivityRow
const ActivityRow = {
  props: ['icon', 'iconColor', 'iconBg', 'title', 'sub', 'time', 'badge', 'badgeColor'],
  template: `
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" :style="'background:' + iconBg">
        <i :class="['pi', icon, 'text-sm']" :style="'color:' + iconColor"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-800 truncate">{{ title }}</p>
        <p class="text-xs text-gray-400 truncate">{{ sub }}</p>
      </div>
      <div class="flex flex-col items-end gap-1">
        <span class="text-xs text-gray-400">{{ time }}</span>
        <span v-if="badge" class="text-[10px] font-bold px-2 py-0.5 rounded-full" :style="'background:' + badgeColor + '20; color:' + badgeColor">{{ badge }}</span>
      </div>
    </div>
  `
}

// VehicleRow
const VehicleRow = {
  props: ['name', 'plate', 'type', 'rentals', 'revenue', 'available'],
  template: `
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:#fef2f2;">
        <i class="pi pi-car text-base" style="color:#c0392b;"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-800">{{ name }}</p>
        <p class="text-xs text-gray-400">{{ plate }} · {{ type }}</p>
      </div>
      <div class="text-right">
        <p class="text-sm font-bold text-gray-800">{{ revenue }}</p>
        <p class="text-xs text-gray-400">{{ rentals }} rentas</p>
      </div>
      <span
        class="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
        :style="available ? 'background:#dcfce7;color:#16a34a' : 'background:#fef2f2;color:#c0392b'"
      >{{ available ? 'Disponible' : 'Rentado' }}</span>
    </div>
  `
}

// ── Data ────────────────────────────────────────────────────

const today = computed(() => new Date().toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' }))

const activeTab = ref('Hoy')

const stats = [
  { label: 'Total reservas',  sub: 'Este mes',          value: '1,248',  color: '#c0392b', icon: 'pi-calendar',    progress: 78, progressLabel: 'Crecimiento YoY' },
  { label: 'Vehículos',       sub: 'Flota activa',       value: '84',     color: '#f0a500', icon: 'pi-car',         progress: 84, progressLabel: 'Disponibilidad' },
  { label: 'Ingresos',        sub: 'Mes actual',         value: '$12.4K', color: '#3b82f6', icon: 'pi-dollar',      progress: 62, progressLabel: 'Meta mensual' },
  { label: 'Clientes activos',sub: 'Registrados',        value: '312',    color: '#22c55e', icon: 'pi-users',       progress: 91, progressLabel: 'Retención' },
]

const incomeData  = [30, 55, 40, 70, 60, 80, 65, 90, 75, 95, 85, 100]
const reservasData = [20, 35, 50, 30, 60, 45, 70, 55, 80, 65, 75, 88]

const activity = [
  { id:1, icon:'pi-calendar-plus', iconColor:'#c0392b', iconBg:'#fef2f2', title:'Nueva reserva — Toyota Corolla', sub:'Cliente: María González', time:'Hace 5 min', badge:'Nueva', badgeColor:'#c0392b' },
  { id:2, icon:'pi-check-circle',  iconColor:'#22c55e', iconBg:'#dcfce7', title:'Contrato firmado #1042',         sub:'Honda Civic · ABC-456',  time:'Hace 18 min', badge:'Completado', badgeColor:'#22c55e' },
  { id:3, icon:'pi-credit-card',   iconColor:'#3b82f6', iconBg:'#eff6ff', title:'Pago recibido $340',             sub:'Reserva #0981',          time:'Hace 34 min', badge:'Pagado', badgeColor:'#3b82f6' },
  { id:4, icon:'pi-wrench',        iconColor:'#f0a500', iconBg:'#fffbeb', title:'Mantenimiento programado',       sub:'Nissan Sentra · XYZ-789', time:'Hace 1 hr',  badge:'Pendiente', badgeColor:'#f0a500' },
  { id:5, icon:'pi-user-plus',     iconColor:'#8b5cf6', iconBg:'#f5f3ff', title:'Nuevo cliente registrado',      sub:'Carlos Mendoza',          time:'Hace 2 hrs', badge:'Nuevo', badgeColor:'#8b5cf6' },
]

const topVehicles = [
  { name:'Toyota Corolla',  plate:'ABC-123', type:'Sedán',    rentals:24, revenue:'$3,120', available: false },
  { name:'Honda Civic',     plate:'ABC-456', type:'Sedán',    rentals:19, revenue:'$2,470', available: true  },
  { name:'Nissan X-Trail',  plate:'DEF-789', type:'SUV',      rentals:17, revenue:'$2,890', available: true  },
  { name:'Hyundai Tucson',  plate:'GHI-321', type:'SUV',      rentals:14, revenue:'$2,380', available: false },
  { name:'Kia Sportage',    plate:'JKL-654', type:'SUV',      rentals:11, revenue:'$1,870', available: true  },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
</style>
