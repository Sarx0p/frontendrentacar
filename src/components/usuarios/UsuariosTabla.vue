<template>
  <div>
    <!-- Filtros y búsqueda -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
        <input
          :value="search"
          @input="$emit('update:search', $event.target.value)"
          type="text"
          placeholder="Buscar por nombre o correo..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none transition"
        />
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="f in filtros"
          :key="f.value"
          @click="$emit('update:filtro', f.value)"
          class="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
          :style="filtroActivo === f.value
            ? 'background:#c0392b; color:white; border-color:#c0392b;'
            : 'background:white; color:#6b7280; border-color:#e5e7eb;'"
        >{{ f.label }}</button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="background:#fafafa; border-bottom:1px solid #f3f4f6;">
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-400">Usuario</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-400">Correo</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-400">Rol</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-400">Estado</th>
              <th class="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="usuario in usuarios"
              :key="usuario.id"
              class="border-b border-gray-50 hover:bg-gray-50/80 transition-colors"
            >
              <!-- Usuario -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    :style="`background:${avatarColor(nombreCompleto(usuario))}`"
                  >{{ initials(usuario) }}</div>
                  <div>
                    <p class="font-semibold text-gray-800">{{ nombreCompleto(usuario) }}</p>
                    <p class="text-xs text-gray-400">{{ usuario.telefono || '—' }}</p>
                  </div>
                </div>
              </td>

              <!-- Correo -->
              <td class="px-5 py-4 text-gray-600">{{ usuario.correo }}</td>

              <!-- Rol -->
              <td class="px-5 py-4">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="rolStyle(rolNombre(usuario))">
                  <i :class="['pi', rolIcon(rolNombre(usuario)), 'mr-1 text-[10px]']"></i>
                  {{ rolNombre(usuario) }}
                </span>
              </td>

              <!-- Estado -->
              <td class="px-5 py-4">
                <span
                  class="text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer"
                  :style="usuario.estado === 'ACTIVO'
                    ? 'background:#dcfce7;color:#166534;'
                    : 'background:#fee2e2;color:#991b1b;'"
                  @click="$emit('toggle-estado', usuario)"
                >{{ usuario.estado === 'ACTIVO' ? 'Activo' : 'Inactivo' }}</span>
              </td>

              <!-- Acciones -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="$emit('editar', usuario)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:shadow-sm"
                    style="border-color:#e5e7eb; color:#6b7280;"
                    title="Editar"
                  ><i class="pi pi-pencil text-xs"></i></button>
                  <button
                    @click="$emit('eliminar', usuario)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:shadow-sm"
                    style="border-color:#fee2e2; color:#c0392b;"
                    title="Eliminar"
                  ><i class="pi pi-trash text-xs"></i></button>
                </div>
              </td>
            </tr>

            <tr v-if="usuarios.length === 0">
              <td colspan="5" class="px-5 py-16 text-center">
                <i class="pi pi-users text-4xl text-gray-200 mb-3 block"></i>
                <p class="text-gray-400 font-medium">No se encontraron usuarios</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
        {{ usuarios.length }} usuario{{ usuarios.length !== 1 ? 's' : '' }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  usuarios:     { type: Array, default: () => [] },
  search:       String,
  filtroActivo: String,
  filtros:      Array,
})

defineEmits(['update:search', 'update:filtro', 'editar', 'eliminar', 'toggle-estado'])

const colores = ['#c0392b','#f0a500','#2563eb','#16a34a','#7c3aed','#0891b2']

// nombre completo desde campos separados
function nombreCompleto(u) {
  return `${u.nombre || ''} ${u.apellido || ''}`.trim() || '—'
}

// iniciales desde nombre y apellido separados
function initials(u) {
  const n = u.nombre?.[0] || ''
  const a = u.apellido?.[0] || ''
  return (n + a).toUpperCase() || '?'
}

function avatarColor(nombre) {
  if (!nombre) return '#c0392b'
  let h = 0
  for (let i = 0; i < nombre.length; i++) h = nombre.charCodeAt(i) + ((h << 5) - h)
  return colores[Math.abs(h) % colores.length]
}

// el rol viene como array de objetos: [{ name: 'EMPLEADO' }]
function rolNombre(u) {
  return u.roles?.[0]?.name || '—'
}

function rolStyle(rol) {
  const map = {
    'ADMINISTRADOR': 'background:#fef2f2; color:#c0392b;',
    'EMPLEADO':      'background:#dbeafe; color:#1e40af;',
    'CONTADOR':      'background:#f3e8ff; color:#7c3aed;',
  }
  return map[rol] || 'background:#f3f4f6; color:#4b5563;'
}

function rolIcon(rol) {
  return { 'ADMINISTRADOR': 'pi-shield', 'EMPLEADO': 'pi-user', 'CONTADOR': 'pi-calculator' }[rol] || 'pi-user'
}
</script>
