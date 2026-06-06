<template>
  <div
    class="min-h-screen transition-colors"
    :class="isDark ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'"
  >
    <AppSidebar @collapsed-change="sidebarCollapsed = $event" />
    <AppHeader :sidebar-collapsed="sidebarCollapsed" />

    <!-- Page content -->
    <main
      class="transition-all duration-300 pt-16"
      :style="{ marginLeft: sidebarCollapsed ? '64px' : '256px' }"
    >
      <div class="p-6">
        <router-view />
        <!-- If not using Vue Router, replace <router-view /> with your page component -->
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'

const sidebarCollapsed = ref(false)
const { isDark } = storeToRefs(useThemeStore())
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) authStore.me().catch(() => {})
})
</script>
