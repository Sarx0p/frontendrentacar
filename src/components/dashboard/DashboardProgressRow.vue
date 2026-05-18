<template>
  <div>
    <div class="flex justify-between text-xs mb-1">
      <span class="font-semibold" :class="isDark ? 'text-gray-300' : 'text-gray-600'">{{ label }}</span>
      <span class="font-bold" :style="{ color }">{{ value }}%</span>
    </div>
    <div
      class="w-full h-1.5 rounded-full overflow-hidden"
      :class="isDark ? 'bg-gray-800' : 'bg-gray-100'"
    >
      <div
        class="h-full rounded-full transition-all duration-700"
        :style="{ width: value + '%', background: color }"
      />
    </div>
  </div>
</template>

<script setup>
import { useAppTheme } from '@/composables/useAppTheme'

defineProps({
  label: String,
  value: Number,
  color: String,
})

const { isDark } = useAppTheme()
</script>
