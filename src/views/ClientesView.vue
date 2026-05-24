<template>
  <div class="min-h-screen bg-gray-50">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Clientes</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestiona los clientes registrados</p>
      </div>
      <button
        @click="abrirModalCrear"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
        style="background:#c0392b;"
      >
        <i class="pi pi-plus text-sm"></i>
        Nuevo cliente
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex gap-3">
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre, DUI o teléfono..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none transition"
        />
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="background:#fafafa; border-bottom:1px solid #f3f4f6;">
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-400">Cliente</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-400">DUI</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-400">Licencia</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-400">Ubicación</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-400">Licencia vigente</th>
              <th class="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cliente in clientesFiltrados"
              :key="cliente.id"
              class="border-b border-gray-50 hover:bg-gray-50/80 transition-colors"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    :style="`background:${avatarColor(cliente.nombre)}`"
                  >{{ initials(cliente.nombre) }}</div>
                  <div>
                    <p class="font-semibold text-gray-800">{{ cliente.nombre }}</p>
                    <p class="text-xs text-gray-400">{{ cliente.telefono }}</p>
                  </div>
                </div>
              </td>

              <td class="px-5 py-4 text-gray-600">{{ cliente.dui }}</td>

              <td class="px-5 py-4">
                <p class="text-gray-700 font-medium">{{ cliente.numero_licencia }}</p>
                <p class="text-xs text-gray-400">Vence: {{ formatFecha(cliente.vencimiento_licencia) }}</p>
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ cliente.municipio }}, {{ cliente.departamento }}
              </td>

              <td class="px-5 py-4">
                <span
                  class="text-xs font-bold px-2.5 py-1 rounded-full"
                  :style="licenciaVigente(cliente.vencimiento_licencia)
                    ? 'background:#dcfce7; color:#166534;'
                    : 'background:#fee2e2; color:#991b1b;'"
                >
                  {{ licenciaVigente(cliente.vencimiento_licencia) ? 'Vigente' : 'Vencida' }}
                </span>
              </td>

              <!-- Acciones -->
              <td class="px-5 py-4">
                <button
                  @click="abrirModalEditar(cliente)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:shadow-sm"
                  style="border-color:#e5e7eb; color:#6b7280;"
                  title="Editar"
                ><i class="pi pi-pencil text-xs"></i></button>
              </td>
            </tr>

            <tr v-if="clientesFiltrados.length === 0">
              <td colspan="6" class="px-5 py-16 text-center">
                <i class="pi pi-users text-4xl text-gray-200 mb-3 block"></i>
                <p class="text-gray-400 font-medium">No se encontraron clientes</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
        {{ clientesFiltrados.length }} cliente{{ clientesFiltrados.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Modal crear/editar -->
    <ClientesModal
      :visible="modalAbierto"
      :modo-edicion="modoEdicion"
      :cliente="clienteSeleccionado"
      @guardar="guardarCliente"
      @cerrar="modalAbierto = false"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ClientesModal from '@/components/clientes/ClientesModal.vue'
import { useClientesStore } from '@/stores/clientes'

const store = useClientesStore()

const search             = ref('')
const modalAbierto       = ref(false)
const modoEdicion        = ref(false)
const clienteSeleccionado = ref(null)

const clientes = computed(() => store.clientes)

onMounted(() => store.fetchClientes())

const clientesFiltrados = computed(() => {
  if (!search.value.trim()) return clientes.value
  const q = search.value.toLowerCase()
  return clientes.value.filter(c =>
    c.nombre?.toLowerCase().includes(q) ||
    c.dui?.toLowerCase().includes(q) ||
    c.telefono?.toLowerCase().includes(q)
  )
})

function abrirModalCrear() {
  modoEdicion.value = false
  clienteSeleccionado.value = null
  modalAbierto.value = true
}

function abrirModalEditar(cliente) {
  modoEdicion.value = true
  clienteSeleccionado.value = { ...cliente }
  modalAbierto.value = true
}

async function guardarCliente(form) {
  if (modoEdicion.value) {
    await store.actualizar(form)
  } else {
    await store.crear(form)
  }
  modalAbierto.value = false
}

const colores = ['#c0392b','#f0a500','#2563eb','#16a34a','#7c3aed','#0891b2']
function avatarColor(nombre) {
  if (!nombre) return '#c0392b'
  let h = 0
  for (let i = 0; i < nombre.length; i++) h = nombre.charCodeAt(i) + ((h << 5) - h)
  return colores[Math.abs(h) % colores.length]
}
function initials(nombre) {
  if (!nombre) return '?'
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-SV')
}
function licenciaVigente(vencimiento) {
  if (!vencimiento) return false
  return new Date(vencimiento) > new Date()
}
</script>
