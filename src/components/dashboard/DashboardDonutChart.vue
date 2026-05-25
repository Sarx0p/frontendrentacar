<template>
  <div class="relative w-full" style="height: 160px;">
    <canvas
      ref="canvas"
      role="img"
      aria-label="Distribución de vehículos por estado"
    ></canvas>
  </div>
  <!-- leyenda manual -->
  <div class="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
    <span
      v-for="item in data"
      :key="item.label"
      class="flex items-center gap-1.5 text-xs font-semibold"
      :class="isDark ? 'text-gray-300' : 'text-gray-600'"
    >
      <span
        class="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0"
        :style="{ background: item.color }"
      ></span>
      {{ item.label }} ({{ item.value }})
    </span>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'

const props = defineProps({
  data: { type: Array, required: true }, // [{ label, value, color }]
})

const { isDark } = useAppTheme()
const canvas = ref(null)
let chartInstance = null

async function renderChart() {
  if (!canvas.value || !props.data.length) return

  const { Chart, ArcElement, DoughnutController, Tooltip } = await import('chart.js')
  Chart.register(ArcElement, DoughnutController, Tooltip)

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  chartInstance = new Chart(canvas.value, {
    type: 'doughnut',
    data: {
      labels: props.data.map((d) => d.label),
      datasets: [{
        data:            props.data.map((d) => d.value),
        backgroundColor: props.data.map((d) => d.color),
        borderWidth: 2,
        borderColor: isDark.value ? '#111827' : '#ffffff',
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed} vehículos`,
          },
        },
      },
    },
  })
}

onMounted(async () => {
  await nextTick()
  renderChart()
})

watch(() => props.data, () => renderChart(), { deep: true })
watch(isDark,           () => renderChart())

onUnmounted(() => chartInstance?.destroy())
</script>
