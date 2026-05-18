<template>
  <aside
    :class="[
      'fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 bg-[#3b0a0a]',
      collapsed ? 'w-16' : 'w-64',
    ]"
  >
    <div class="flex items-center gap-3 px-4 py-5 border-b border-red-900/40 min-h-[64px]">
      <div class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style="background:#c0392b;"></div>
      <div v-if="!collapsed" class="flex flex-col leading-tight">
        <span class="text-white font-extrabold text-base tracking-widest uppercase">RentaCar</span>
        <span class="text-xs font-semibold tracking-widest uppercase" style="color:#f0a500;">Administrador</span>
      </div>
      <button
        class="ml-auto transition-colors"
        style="color: #f0a500;"
        @click="toggleCollapse"
      >
        <i :class="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'" class="text-base"></i>
      </button>
    </div>

    <nav class="flex-1 min-h-0 overflow-y-auto py-4 px-2 space-y-4">
      <div>
        <p v-if="!collapsed" class="text-xs font-bold tracking-widest uppercase px-3 mb-2" style="color:#f0a50088;">Principal</p>
        <SidebarItem icon="pi-home" label="Dashboard" :collapsed="collapsed" :active="activeRoute === 'dashboard'" @click="activeRoute = 'dashboard'" />
        <SidebarItem icon="pi-car" label="Vehículos" :collapsed="collapsed" :active="activeRoute === 'vehiculos'" @click="activeRoute = 'vehiculos'" :badge="84" />
        <SidebarItem icon="pi-users" label="Clientes" :collapsed="collapsed" :active="activeRoute === 'clientes'" @click="activeRoute = 'clientes'" />
        <SidebarItem icon="pi-file" label="Contratos" :collapsed="collapsed" :active="activeRoute === 'contratos'" @click="activeRoute = 'contratos'" :badge="12" />
        <SidebarItem icon="pi-calendar" label="Reservas" :collapsed="collapsed" :active="activeRoute === 'reservas'" @click="activeRoute = 'reservas'" :badge="5" badgeColor="#260907" />
      </div>

      <div>
        <p v-if="!collapsed" class="text-xs font-bold tracking-widest uppercase px-3 mb-2" style="color:#f0a50088;">Operaciones</p>
        <SidebarItem icon="pi-credit-card" label="Pagos" :collapsed="collapsed" :active="activeRoute === 'pagos'" @click="activeRoute = 'pagos'" />
        <SidebarItem icon="pi-wrench" label="Mantenimiento" :collapsed="collapsed" :active="activeRoute === 'mant'" @click="activeRoute = 'mant'" :badge="3" />
        <SidebarItem icon="pi-chart-bar" label="Reportes" :collapsed="collapsed" :active="activeRoute === 'reportes'" @click="activeRoute = 'reportes'" />
      </div>

      <div>
        <p v-if="!collapsed" class="text-xs font-bold tracking-widest uppercase px-3 mb-2" style="color:#f0a50088;">Admin</p>
        <SidebarItem icon="pi-id-card" label="Empleados" :collapsed="collapsed" :active="activeRoute === 'empleados'" @click="activeRoute = 'empleados'" />
        <SidebarItem icon="pi-lock" label="Permisos" :collapsed="collapsed" :active="activeRoute === 'permisos'" @click="activeRoute = 'permisos'" />
        <SidebarItem icon="pi-cog" label="Configuración" :collapsed="collapsed" :active="activeRoute === 'config'" @click="activeRoute = 'config'" />

        <div
          class="rounded-lg mx-1 mt-2 px-2 py-2.5 bg-black/20"
          :class="collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between gap-2'"
        >
          <div v-if="!collapsed" class="flex items-center gap-2 min-w-0 text-xs font-semibold text-white/90">
            <i class="pi pi-moon text-sm flex-shrink-0 text-[#f0a500]" />
            <span class="truncate">Modo oscuro</span>
          </div>
          <i v-else class="pi pi-moon text-sm text-[#f0a500]" title="Modo oscuro" />
          <InputSwitch v-model="darkSwitch" />
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputSwitch from 'primevue/inputswitch'
import SidebarItem from './SidebarItem.vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const darkSwitch = computed({
  get: () => themeStore.isDark,
  set: (v) => themeStore.setDark(v),
})

const emit = defineEmits(['collapsed-change'])

const collapsed = ref(false)
const activeRoute = ref('reservas')

function toggleCollapse() {
  collapsed.value = !collapsed.value
  emit('collapsed-change', collapsed.value)
}
</script>
