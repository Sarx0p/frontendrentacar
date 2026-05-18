<template>
  <div class="flex items-center gap-3">
    <div
      class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      :style="{ background: iconBg }"
    >
      <i :class="['pi', icon, 'text-sm']" :style="{ color: iconColor }" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold truncate" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ title }}</p>
      <p class="text-xs truncate" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ sub }}</p>
    </div>
    <div class="flex flex-col items-end gap-1">
      <span class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ time }}</span>
      <span
        v-if="badge"
        class="text-[10px] font-bold px-2 py-0.5 rounded-full"
        :style="{ background: badgeColor + '20', color: badgeColor }"
      >{{ badge }}</span>
    </div>
  </div>
</template>

<script setup>
import { useAppTheme } from '@/composables/useAppTheme'

defineProps({
  icon: String,
  iconColor: String,
  iconBg: String,
  title: String,
  sub: String,
  time: String,
  badge: String,
  badgeColor: String,
})

const { isDark } = useAppTheme()
</script>
