<template>
  <button
    @click="$emit('click')"
    :title="collapsed ? label : ''"
    class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 mb-0.5 transition-all duration-150 group relative"
    :style="buttonStyle"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <i :class="['pi', icon, 'text-base flex-shrink-0']"></i>
    <span v-if="!collapsed" class="text-sm flex-1 text-left truncate">{{ label }}</span>
    <span
      v-if="badge && !collapsed"
      class="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
      :style="badgeStyle"
    >{{ badge }}</span>

    <div
      v-if="collapsed && hovered"
      class="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-50 pointer-events-none"
    >
      {{ label }}
      <span
        v-if="badge"
        class="ml-1 text-xs font-bold px-1 py-0.5 rounded-full"
        :style="badgeStyle"
      >{{ badge }}</span>
    </div>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  icon: String,
  label: String,
  collapsed: Boolean,
  active: Boolean,
  badge: Number,
  badgeColor: String,
})
defineEmits(['click'])

const hovered = ref(false)

const buttonStyle = computed(() => {
  if (props.active) return { background: '#c0392b', color: 'white', fontWeight: '600' }
  if (hovered.value) return { background: 'rgba(255,255,255,0.07)', color: 'white' }
  return { background: 'transparent', color: 'rgba(255,255,255,0.6)' }
})

const badgeStyle = computed(() => {
  const c = props.badgeColor || '#f0a500'
  if (props.badgeColor) return { background: c, color: '#fff' }
  return { background: '#f0a500', color: '#3b0a0a' }
})
</script>
