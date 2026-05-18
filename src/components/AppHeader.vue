<template>
  <header
    class="fixed top-0 right-0 z-40 flex items-center gap-4 px-6 shadow-sm transition-colors border-b"
    :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
    :style="{ left: sidebarWidth, height: '64px' }"
  >
    <div class="flex-1 max-w-lg">
      <div class="relative w-full">
        <span
          class="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center"
          aria-hidden="true"
        >
          <i
            class="pi pi-search text-sm leading-none"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
          />
        </span>
        <InputText
          v-model="search"
          placeholder="Buscar vehículos, clientes, contratos..."
          class="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm leading-normal focus:outline-none focus:ring-2 focus:ring-red-800/30 transition"
          :class="isDark
            ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder:text-gray-500'
            : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'"
          :style="searchFieldStyle"
        />
      </div>
    </div>

    <div class="flex items-center gap-2 ml-auto">
      <button
        type="button"
        class="relative p-2 rounded-full transition-colors"
        :class="isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'"
      >
        <i class="pi pi-bell text-lg" :class="isDark ? 'text-gray-400' : 'text-gray-500'" />
        <span class="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style="background:#c0392b;">-</span>
      </button>

      <div class="w-px h-8 mx-1" :class="isDark ? 'bg-gray-700' : 'bg-gray-200'" />

      <button
        type="button"
        class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg transition-colors"
        :class="isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'"
        @click="userMenuOpen = !userMenuOpen"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style="background:#c0392b;"
        >JR</div>
        <div class="flex flex-col items-start leading-tight">
          <span class="text-sm font-semibold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">usuario</span>
          <span class="text-xs font-medium" style="color:#f0a500;">Administrador</span>
        </div>
        <i class="pi pi-chevron-down text-xs ml-1" :class="isDark ? 'text-gray-500' : 'text-gray-400'" />
      </button>

      <div
        v-if="userMenuOpen"
        class="absolute top-16 right-4 rounded-xl shadow-lg border py-2 w-48 z-50"
        :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'"
      >
        <button
          type="button"
          class="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
          :class="isDark ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'"
        >
          <i class="pi pi-user" :class="isDark ? 'text-gray-500' : 'text-gray-400'" /> Mi perfil
        </button>
        <button
          type="button"
          class="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
          :class="isDark ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'"
        >
          <i class="pi pi-cog" :class="isDark ? 'text-gray-500' : 'text-gray-400'" /> Configuración
        </button>
        <div class="border-t my-1" :class="isDark ? 'border-gray-800' : 'border-gray-100'" />
        <button
          type="button"
          class="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
          :class="isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'"
          style="color:#c0392b;"
        >
          <i class="pi pi-sign-out" style="color:#c0392b;" /> Cerrar sesión
        </button>
      </div>
    </div>
  </header>

  <div v-if="userMenuOpen" class="fixed inset-0 z-30" @click="userMenuOpen = false" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import InputText from 'primevue/inputtext'
import { useThemeStore } from '@/stores/theme'

const { isDark } = storeToRefs(useThemeStore())

const props = defineProps({
  sidebarCollapsed: {
    type: Boolean,
    default: false,
  },
})

const search = ref('')
const userMenuOpen = ref(false)

const sidebarWidth = computed(() => (props.sidebarCollapsed ? '64px' : '256px'))

/** Fuerza fondo/borde por encima de estilos del tema de PrimeVue */
const searchFieldStyle = computed(() => ({
  paddingLeft: '2.5rem',
  backgroundColor: isDark.value ? '#1f2937' : '#ffffff',
  color: isDark.value ? '#f3f4f6' : '#111827',
  borderColor: isDark.value ? '#4b5563' : '#e5e7eb',
}))
</script>
