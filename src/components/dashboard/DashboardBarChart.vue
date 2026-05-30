<template>
  <div class="relative w-full" style="height: 160px;">
    <canvas ref="canvas" role="img" aria-label="Reservas por mes"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'

const props = defineProps({
  data:  { type: Array,  required: true },
  color: { type: String, default: '#c0392b' },
})

const { isDark } = useAppTheme()
const canvas = ref(null)
let chartInstance = null

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

async function renderChart() {
  if (!canvas.value) return

  const { Chart, BarElement, BarController, CategoryScale, LinearScale, Tooltip } = await import('chart.js')
  Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip)

  if (chartInstance) { chartInstance.destroy(); chartInstance = null }

  const gridColor  = isDark.value ? '#1f2937' : '#f3f4f6'
  const labelColor = isDark.value ? '#6b7280' : '#9ca3af'

  chartInstance = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: MESES,
      datasets: [{
        data:            props.data,
        backgroundColor: props.color + 'cc',
        borderRadius:    6,
        borderSkipped:   false,
        hoverBackgroundColor: props.color,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y} reservas`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: labelColor, font: { size: 10 } },
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: labelColor, font: { size: 10 }, precision: 0 },
          beginAtZero: true,
        },
      },
    },
  })
}

onMounted(async () => { await nextTick(); renderChart() })
watch(() => props.data, () => renderChart(), { deep: true })
watch(isDark, () => renderChart())
onUnmounted(() => chartInstance?.destroy())
</script>
