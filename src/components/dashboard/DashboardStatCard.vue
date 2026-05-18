<template>
  <div
    class="rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all duration-200"
    :class="isDark
      ? 'bg-gray-900 border-gray-800'
      : 'bg-white border-gray-100'"
  >
    <div class="flex items-start justify-between mb-3">
      <div>
        <p
          class="text-xs font-bold uppercase tracking-widest"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >{{ label }}</p>
        <p
          class="text-[11px] mt-0.5"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >{{ sub }}</p>
      </div>
      <div class="w-9 h-9 rounded-xl flex items-center justify-center" :style="{ background: color + '18' }">
        <i :class="['pi', icon]" :style="{ color }" class="text-base" />
      </div>
    </div>
    <p class="text-3xl font-extrabold mb-3" :style="{ color }">{{ value }}</p>
    <div
      class="w-full h-1.5 rounded-full overflow-hidden"
      :class="isDark ? 'bg-gray-800' : 'bg-gray-100'"
    >
      <div
        class="h-full rounded-full transition-all duration-700"
        :style="{ width: progress + '%', background: color }"
      />
    </div>
    <div
      class="flex justify-between mt-1.5 text-[11px]"
      :class="isDark ? 'text-gray-500' : 'text-gray-400'"
    >
      <span>{{ progressLabel }}</span>
      <span>100%</span>
    </div>
  </div>
</template>

<script setup>
import { useAppTheme } from '@/composables/useAppTheme'

defineProps({
  label: String,
  sub: String,
  value: String,
  color: String,
  icon: String,
  progress: Number,
  progressLabel: String,
})

const { isDark } = useAppTheme()
</script>
