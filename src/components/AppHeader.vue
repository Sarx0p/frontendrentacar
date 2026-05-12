<template>
  <header class="fixed top-0 right-0 z-40 flex items-center gap-4 px-6 bg-white border-b border-gray-200 shadow-sm"
    :style="{ left: sidebarWidth, height: '64px' }"
  >
    <!-- Search -->
    <div class="flex-1 max-w-lg">
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none"></i>
        <InputText
          v-model="search"
          placeholder="Buscar vehículos, clientes, contratos..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-800/30 transition"
          style="padding-left: 2.5rem;"
        />
      </span>
    </div>

    <div class="flex items-center gap-2 ml-auto">
      <!-- Notifications -->
      <button class="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
        <i class="pi pi-bell text-gray-500 text-lg"></i>
        <span class="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style="background:#c0392b;">-</span>
      </button>

      <!-- Divider -->
      <div class="w-px h-8 bg-gray-200 mx-1"></div>

      <!-- User -->
      <button
        class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        @click="userMenuOpen = !userMenuOpen"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style="background:#c0392b;"
        >JR</div>
        <div class="flex flex-col items-start leading-tight">
          <span class="text-sm font-semibold text-gray-800">usuario</span>
          <span class="text-xs font-medium" style="color:#f0a500;">Administrador</span>
        </div>
        <i class="pi pi-chevron-down text-gray-400 text-xs ml-1"></i>
      </button>

      <!-- Simple dropdown -->
      <div
        v-if="userMenuOpen"
        class="absolute top-16 right-4 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-48 z-50"
      >
        <button class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          <i class="pi pi-user text-gray-400"></i> Mi perfil
        </button>
        <button class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          <i class="pi pi-cog text-gray-400"></i> Configuración
        </button>
        <div class="border-t border-gray-100 my-1"></div>
        <button class="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" style="color:#c0392b;">
          <i class="pi pi-sign-out" style="color:#c0392b;"></i> Cerrar sesión
        </button>
      </div>
    </div>
  </header>

  <!-- Overlay to close menu -->
  <div v-if="userMenuOpen" class="fixed inset-0 z-30" @click="userMenuOpen = false"></div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputText from 'primevue/inputtext'

const props = defineProps({
  sidebarCollapsed: {
    type: Boolean,
    default: false
  }
})

const search = ref('')
const userMenuOpen = ref(false)

const sidebarWidth = computed(() => props.sidebarCollapsed ? '64px' : '256px')
</script>
