<template>
  <div class="flex items-center gap-3">
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      :class="isDark ? 'bg-red-950/40' : 'bg-red-50'"
    >
      <i class="pi pi-car text-base" style="color: #c0392b" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ name }}</p>
      <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ plate }} · {{ type }}</p>
    </div>
    <div class="text-right">
      <p class="text-sm font-bold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ revenue }}</p>
      <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ rentals }} rentas</p>
    </div>
    <span
      class="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      :style="
        available
          ? { background: '#dcfce7', color: '#16a34a' }
          : { background: '#fef2f2', color: '#c0392b' }
      "
    >{{ available ? 'Disponible' : 'Rentado' }}</span>
  </div>
</template>

<script setup>
import { useAppTheme } from '@/composables/useAppTheme'

defineProps({
  name: String,
  plate: String,
  type: String,
  rentals: Number,
  revenue: String,
  available: Boolean,
})

const { isDark } = useAppTheme()
</script>
