<template>
  <aside
    :class="[
      'fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 bg-[#a62b1e]',
      collapsed ? 'w-16' : 'w-64',
    ]"
  >
    <div class="flex items-center gap-3 px-4 py-5 border-b border-red-900/40 min-h-[64px]">
      <div class="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden">
        <img :src="logoElGuayabo" alt="El Guayabo RentCar" class="w-full h-full object-contain" />
      </div>
      <div v-if="!collapsed" class="flex flex-col leading-tight">
        <span class="text-white font-extrabold text-base tracking-widest uppercase">RentaCar</span>
        <span class="text-xs font-semibold tracking-widest uppercase" style="color: #f0a500"
          >Administrador</span
        >
      </div>
      <button class="ml-auto transition-colors" style="color: #f0a500" @click="toggleCollapse">
        <i :class="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'" class="text-base"></i>
      </button>
    </div>

    <nav class="flex-1 min-h-0 overflow-y-auto py-4 px-2 space-y-4">
      <div>
        <p
          v-if="!collapsed"
          class="text-xs font-bold tracking-widest uppercase px-3 mb-2"
          style="color: #f0a50088"
        >
          Principal
        </p>
        <SidebarItem
          icon="pi-home"
          label="Dashboard"
          :collapsed="collapsed"
          :active="activeRoute === 'dashboard'"
          @click="navegar('dashboard')"
        />
        <SidebarItem
          icon="pi-car"
          label="Vehículos"
          :collapsed="collapsed"
          :active="activeRoute === 'vehiculos'"
          @click="navegar('vehiculos')"
        />
        <SidebarItem
          icon="pi-users"
          label="Clientes"
          :collapsed="collapsed"
          :active="activeRoute === 'clientes'"
          @click="navegar('clientes')"
        />
        <SidebarItem
          icon="pi-file"
          label="Contratos"
          :collapsed="collapsed"
          :active="activeRoute === 'contratos'"
          @click="navegar('contratos')"
        />
        <SidebarItem
          icon="pi-calendar"
          label="Reservas"
          :collapsed="collapsed"
          :active="activeRoute === 'reservas'"
          @click="navegar('reservas')"
        />
      </div>

      <div>
        <p
          v-if="!collapsed"
          class="text-xs font-bold tracking-widest uppercase px-3 mb-2"
          style="color: #f0a50088"
        >
          Operaciones
        </p>
        <SidebarItem
          icon="pi-credit-card"
          label="Pagos"
          :collapsed="collapsed"
          :active="activeRoute === 'pagos'"
          @click="navegar('pagos')"
        />
        <SidebarItem
          icon="pi-wrench"
          label="Mantenimiento"
          :collapsed="collapsed"
          :active="activeRoute === 'mantenimiento'"
          @click="navegar('mantenimiento')"
        />
        <SidebarItem
          icon="pi-chart-bar"
          label="Reportes"
          :collapsed="collapsed"
          :active="activeRoute === 'reportes'"
          @click="navegar('reportes')"
        />
      </div>

      <div>
        <p
          v-if="!collapsed"
          class="text-xs font-bold tracking-widest uppercase px-3 mb-2"
          style="color: #f0a50088"
        >
          Admin
        </p>
        <SidebarItem
          icon="pi-id-card"
          label="Usuarios"
          :collapsed="collapsed"
          :active="activeRoute === 'usuarios'"
          @click="navegar('usuarios')"
        />
        <SidebarItem
          icon="pi-lock"
          label="Permisos"
          :collapsed="collapsed"
          :active="activeRoute === 'permisos'"
          @click="navegar('permisos')"
        />
        <SidebarItem
          icon="pi-cog"
          label="Configuración"
          :collapsed="collapsed"
          :active="activeRoute === 'configuracion'"
          @click="navegar('configuracion')"
        />

        <div
          class="rounded-lg mx-1 mt-2 px-2 py-2.5 bg-black/20"
          :class="
            collapsed
              ? 'flex flex-col items-center gap-2'
              : 'flex items-center justify-between gap-2'
          "
        >
          <div
            v-if="!collapsed"
            class="flex items-center gap-2 min-w-0 text-xs font-semibold text-white/90"
          >
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
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import InputSwitch from "primevue/inputswitch";
import SidebarItem from "./SidebarItem.vue";
import { useThemeStore } from "@/stores/theme";
import logoElGuayabo from "@/assets/logo-el-guayabo.png";

const themeStore = useThemeStore();
const darkSwitch = computed({
  get: () => themeStore.isDark,
  set: (v) => themeStore.setDark(v),
});

const emit = defineEmits(["collapsed-change"]);
const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const activeRoute = ref("dashboard");

watch(
  () => route.path,
  (path) => {
    const segment = path.replace("/", "").split("/")[0];
    activeRoute.value = segment || "dashboard";
  },
  { immediate: true },
);

function toggleCollapse() {
  collapsed.value = !collapsed.value;
  emit("collapsed-change", collapsed.value);
}

function navegar(ruta) {
  activeRoute.value = ruta;
  router.push("/" + ruta);
}
</script>
