<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.45);"
        @click.self="$emit('cerrar')"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" @click.stop>


          <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#fef2f2;">
                <i class="pi pi-user text-base" style="color:#c0392b;"></i>
              </div>
              <div>
                <p class="font-extrabold text-gray-900">{{ modoEdicion ? 'Editar usuario' : 'Nuevo usuario' }}</p>
                <p class="text-xs text-gray-400">{{ modoEdicion ? 'Actualiza los datos' : 'Completa la información' }}</p>
              </div>
            </div>
            <button @click="$emit('cerrar')" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>

          <!-- formulario para creear -->
          <form @submit.prevent="handleGuardar" class="px-6 py-5 space-y-4">

            <!-- ingreso de nom y apellido -->
            <div class="flex gap-3">
              <div class="flex-1">
                <label class="field-label">Nombre</label>
                <div class="relative">
                  <i class="pi pi-user input-icon"></i>
                  <input v-model="form.nombre" type="text" placeholder="" class="field-input" :class="errors.nombre ? 'error' : ''" />
                </div>
                <p v-if="errors.nombre" class="field-error">{{ errors.nombre }}</p>
              </div>
              <div class="flex-1">
                <label class="field-label">Apellido</label>
                <div class="relative">
                  <i class="pi pi-user input-icon"></i>
                  <input v-model="form.apellido" type="text" placeholder="" class="field-input" :class="errors.apellido ? 'error' : ''" />
                </div>
                <p v-if="errors.apellido" class="field-error">{{ errors.apellido }}</p>
              </div>
            </div>

            <!-- ingreso de correo-->
            <div>
              <label class="field-label">Correo electrónico</label>
              <div class="relative">
                <i class="pi pi-envelope input-icon"></i>
                <input v-model="form.email" type="email" placeholder="usuario@gmail.com" class="field-input" :class="errors.email ? 'error' : ''" />
              </div>
              <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
            </div>

            <!-- tlf -->
            <div>
              <label class="field-label">Teléfono</label>
              <div class="relative">
                <i class="pi pi-phone input-icon"></i>
                <input v-model="form.telefono" type="tel" placeholder="0000-0000" class="field-input" :class="errors.telefono ? 'error' : ''" />
              </div>
              <p v-if="errors.telefono" class="field-error">{{ errors.telefono }}</p>
            </div>

            <!-- rol a asignar -->
            <div>
              <label class="field-label">Rol</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="rol in roles"
                  :key="rol.value"
                  type="button"
                  @click="form.rol = rol.value"
                  class="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all"
                  :style="form.rol === rol.value
                    ? 'border-color:#c0392b; background:#fef2f2;'
                    : 'border-color:#e5e7eb; background:white;'"
                >
                  <div class="w-8 h-8 rounded-full flex items-center justify-center"
                    :style="form.rol === rol.value ? 'background:#c0392b;' : 'background:#f3f4f6;'"
                  >
                    <i :class="['pi', rol.icon, 'text-sm']" :style="form.rol === rol.value ? 'color:white' : 'color:#9ca3af'"></i>
                  </div>
                  <span class="text-xs font-bold" :style="form.rol === rol.value ? 'color:#c0392b' : 'color:#6b7280'">{{ rol.label }}</span>
                </button>
              </div>
              <p v-if="errors.rol" class="field-error mt-1">{{ errors.rol }}</p>
            </div>

            <!-- Contraseña -->
            <div v-if="!modoEdicion">
              <label class="field-label">Contraseña temporal</label>
              <div class="relative">
                <i class="pi pi-lock input-icon"></i>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mínimo 8 caracteres"
                  class="field-input pr-10"
                  :class="errors.password ? 'error' : ''"
                />
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" @click="showPassword = !showPassword">
                  <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
                </button>
              </div>
              <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
            </div>

            <!-- Error global -->
            <div v-if="globalError" class="flex items-center gap-2 p-3 rounded-xl text-sm" style="background:#fef2f2; color:#c0392b; border:1px solid #fecaca;">
              <i class="pi pi-exclamation-circle"></i>{{ globalError }}
            </div>

            <!-- Botones -->
            <div class="flex gap-3 pt-2">
              <button type="button" @click="$emit('cerrar')"
                class="flex-1 py-2.5 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button type="submit" :disabled="loading"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style="background:#c0392b;">
                <i v-if="loading" class="pi pi-spin pi-spinner"></i>
                <i v-else :class="modoEdicion ? 'pi pi-check' : 'pi pi-user-plus'"></i>
                {{ loading ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Crear usuario' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  visible:     Boolean,
  modoEdicion: Boolean,
  usuario:     Object,
})

const emit = defineEmits(['guardar', 'cerrar'])

const roles = [
  { value: 'Administrador', label: 'Administrador', icon: 'pi-shield' },
  { value: 'Empleado',      label: 'Empleado',      icon: 'pi-user' },
  { value: 'Contador',      label: 'Contador',      icon: 'pi-calculator' },
]

const loading     = ref(false)
const showPassword = ref(false)
const globalError = ref('')

const form = reactive({ id: null, nombre: '', apellido: '', email: '', telefono: '', rol: '', password: '' })
const errors = reactive({ nombre: '', apellido: '', email: '', telefono: '', rol: '', password: '' })

// Rellena el form al editar
watch(() => props.visible, (val) => {
  if (!val) return
  globalError.value = ''
  showPassword.value = false
  Object.keys(errors).forEach(k => errors[k] = '')

  if (props.modoEdicion && props.usuario) {
    const [nombre, ...resto] = props.usuario.nombre.split(' ')
    Object.assign(form, {
      id: props.usuario.id,
      nombre,
      apellido: resto.join(' '),
      email:    props.usuario.email,
      telefono: props.usuario.telefono,
      rol:      props.usuario.rol,
      password: '',
    })
  } else {
    Object.assign(form, { id: null, nombre: '', apellido: '', email: '', telefono: '', rol: '', password: '' })
  }
})

function validar() {
  Object.keys(errors).forEach(k => errors[k] = '')
  let ok = true
  if (!form.nombre)   { errors.nombre   = 'Requerido'; ok = false }
  if (!form.apellido) { errors.apellido = 'Requerido'; ok = false }
  if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) { errors.email = 'Correo inválido'; ok = false }
  if (!form.telefono) { errors.telefono = 'Requerido'; ok = false }
  if (!form.rol)      { errors.rol      = 'Selecciona un rol'; ok = false }
  if (!props.modoEdicion && form.password.length < 8) { errors.password = 'Mínimo 8 caracteres'; ok = false }
  return ok
}

async function handleGuardar() {
  if (!validar()) return
  loading.value = true
  globalError.value = ''
  try {
    await new Promise(r => setTimeout(r, 600)) // 🔌 reemplaza con tu API
    emit('guardar', { ...form })
  } catch {
    globalError.value = 'Ocurrió un error. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#4b5563; margin-bottom:0.375rem; }
.input-icon  { position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:#9ca3af; font-size:0.875rem; pointer-events:none; }
.field-input { width:100%; padding:0.75rem 1rem 0.75rem 2.5rem; border-radius:0.75rem; border:1px solid #e5e7eb; background:#f9fafb; font-size:0.875rem; color:#1f2937; transition:all 0.15s; outline:none; }
.field-input:focus { border-color:#c0392b; box-shadow:0 0 0 3px rgba(192,57,43,0.1); background:white; }
.field-input.error { border-color:#f87171; background:#fef2f2; }
.field-error { font-size:0.7rem; color:#c0392b; margin-top:0.25rem; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
