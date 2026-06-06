<template>
  <div
    class="min-h-screen transition-colors duration-300"
    :class="isDark ? 'bg-gray-950' : 'bg-gray-50'"
  >

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1
          class="text-2xl font-extrabold"
          :class="isDark ? 'text-gray-100' : 'text-gray-900'"
        >
          Usuarios
        </h1>

        <p
          class="text-sm mt-0.5"
          :class="isDark ? 'text-gray-400' : 'text-gray-500'"
        >
          Gestiona los usuarios del sistema
        </p>
      </div>

      <button
        @click="abrirModalCrear"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
        style="background:#c0392b;"
      >
        <i class="pi pi-plus text-sm"></i>
        Nuevo usuario
      </button>
    </div>

    <!-- Tabla -->
    <p
      v-if="store.error"
      class="mb-4 text-sm font-medium rounded-xl border px-4 py-3"
      :class="isDark ? 'text-red-300 bg-red-950/30 border-red-900/50' : 'text-red-700 bg-red-50 border-red-200'"
    >
      <i class="pi pi-exclamation-circle mr-1"></i>{{ store.error }}
    </p>

    <div
      class="rounded-2xl border shadow-sm overflow-hidden transition-colors"
      :class="isDark
        ? 'bg-gray-900 border-gray-800'
        : 'bg-white border-gray-100'"
    >
      <UsuariosTabla
        :usuarios="usuariosFiltrados"
        :search="search"
        :filtro-activo="filtroActivo"
        :filtros="filtros"
        @update:search="search = $event"
        @update:filtro="filtroActivo = $event"
        @editar="abrirModalEditar"
        @cambiar-estado="cambiarEstado"
      />
    </div>

    <!-- Modal -->
    <UsuariosModal
      :visible="modalAbierto"
      :modo-edicion="modoEdicion"
      :usuario="usuarioSeleccionado"
      @guardar="guardarUsuario"
      @cerrar="modalAbierto = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UsuariosTabla from '@/components/usuarios/UsuariosTabla.vue'
import UsuariosModal from '@/components/usuarios/UsuariosModal.vue'
import { useUsuariosStore } from '@/stores/usuarios'
import { useAppTheme } from '@/composables/useAppTheme'

const { isDark } = useAppTheme()

const store = useUsuariosStore()

const search = ref('')
const filtroActivo = ref('todos')
const modalAbierto = ref(false)
const modoEdicion = ref(false)
const usuarioSeleccionado = ref(null)

const filtros = [
  { label: 'Todos', value: 'todos' },
  { label: 'Administrador', value: 'ADMINISTRADOR' },
  { label: 'Empleado', value: 'EMPLEADO' },
  { label: 'Contador', value: 'CONTADOR' },
]

const usuarios = computed(() => store.usuarios)

onMounted(() => store.fetchUsuarios())

const usuariosFiltrados = computed(() => {
  let lista = usuarios.value

  if (filtroActivo.value !== 'todos') {
    lista = lista.filter(
      u => u.roles?.[0]?.name === filtroActivo.value
    )
  }

  if (search.value.trim()) {
    const q = search.value.toLowerCase()

    lista = lista.filter(u =>
      u.nombre?.toLowerCase().includes(q) ||
      u.apellido?.toLowerCase().includes(q) ||
      u.correo?.toLowerCase().includes(q)
    )
  }

  return lista
})

function abrirModalCrear() {
  modoEdicion.value = false
  usuarioSeleccionado.value = null
  modalAbierto.value = true
}

function abrirModalEditar(usuario) {
  modoEdicion.value = true
  usuarioSeleccionado.value = { ...usuario }
  modalAbierto.value = true
}

async function cambiarEstado(usuario, nuevoEstado) {
  await store.cambiarEstado(usuario.id, nuevoEstado)
}

async function guardarUsuario(form) {
  if (modoEdicion.value) {
    await store.actualizar(form)
  } else {
    await store.crear(form)
  }

  modalAbierto.value = false
}
</script>
