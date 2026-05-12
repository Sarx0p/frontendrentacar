<template>
  <div class="min-h-screen bg-gray-50">
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
import { ref } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'

const sidebarCollapsed = ref(false)
</script>
