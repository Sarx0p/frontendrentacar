<template>
  <svg viewBox="0 0 260 48" class="w-full" style="height: 48px">
    <path
      :d="path"
      fill="none"
      :stroke="color"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path :d="fillPath" :fill="color" fill-opacity="0.08" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  color: { type: String, required: true },
})

const path = computed(() => {
  const d = props.data
  if (!d?.length) return ''
  const max = Math.max(...d)
  const min = Math.min(...d)
  const w = 260
  const h = 48
  const pts = d.map((v, i) => {
    const x = (i / (d.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * h
    return `${x},${y}`
  })
  return `M${pts.join(' L')}`
})

const fillPath = computed(() => (path.value ? `${path.value} L260,48 L0,48 Z` : ''))
</script>
