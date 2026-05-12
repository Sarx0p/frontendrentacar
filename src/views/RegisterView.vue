<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50" style="font-family: 'Sora', sans-serif;">
    <div class="w-full max-w-md p-6">


      <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/80 p-8 border border-gray-100">
        <h2 class="text-2xl font-extrabold text-gray-900 mb-1">Crear cuenta</h2>
        <p class="text-sm text-gray-500 mb-6">Completa tu información para registrarte</p>

        <form @submit.prevent="handleSubmit" class="space-y-5">

          <!-- Nombre y Apellido -->
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="field-label">Nombre</label>
              <div class="relative">
                <i class="pi pi-user input-icon"></i>
                <input v-model="form.firstName" type="text" placeholder="Jorge" class="field-input" :class="errors.firstName ? 'error' : ''" />
              </div>
              <p v-if="errors.firstName" class="field-error">{{ errors.firstName }}</p>
            </div>
            <div class="flex-1">
              <label class="field-label">Apellido</label>
              <div class="relative">
                <i class="pi pi-user input-icon"></i>
                <input v-model="form.lastName" type="text" placeholder="Ramírez" class="field-input" :class="errors.lastName ? 'error' : ''" />
              </div>
              <p v-if="errors.lastName" class="field-error">{{ errors.lastName }}</p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="field-label">Correo electrónico</label>
            <div class="relative">
              <i class="pi pi-envelope input-icon"></i>
              <input v-model="form.email" type="email" placeholder="admin@rentacar.com" class="field-input" :class="errors.email ? 'error' : ''" />
            </div>
            <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
          </div>

          <!-- Teléfono -->
          <div>
            <label class="field-label">Teléfono</label>
            <div class="relative">
              <i class="pi pi-phone input-icon"></i>
              <input v-model="form.phone" type="tel" placeholder="(555) 123-4567" class="field-input" :class="errors.phone ? 'error' : ''" />
            </div>
            <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
          </div>

          <!-- Contraseña -->
          <div>
            <label class="field-label">Contraseña</label>
            <div class="relative">
              <i class="pi pi-lock input-icon"></i>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 8 caracteres"
                class="field-input pr-10"
                :class="errors.password ? 'error' : ''"
              />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
              </button>
            </div>
            <!-- Fuerza de contraseña -->
            <div class="flex gap-1 mt-2">
              <div v-for="i in 4" :key="i" class="flex-1 h-1 rounded-full transition-all duration-300"
                :style="i <= passwordStrength ? `background:${strengthColor}` : 'background:#e5e7eb'"
              ></div>
            </div>
            <p v-if="form.password" class="text-xs mt-1 font-medium" :style="`color:${strengthColor}`">{{ strengthLabel }}</p>
            <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
          </div>

          <!-- Error global -->
          <div v-if="globalError" class="flex items-center gap-2 p-3 rounded-xl text-sm" style="background:#fef2f2; color:#c0392b; border:1px solid #fecaca;">
            <i class="pi pi-exclamation-circle"></i>
            {{ globalError }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style="background:#c0392b;"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-user-plus"></i>
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="font-bold hover:underline" style="color:#c0392b;">Iniciar sesión</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
})

const errors = reactive({ firstName: '', lastName: '', email: '', phone: '', password: '' })
const globalError = ref('')
const loading = ref(false)
const showPassword = ref(false)

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^a-zA-Z0-9]/.test(p)) s++
  return s
})

const strengthColor = computed(() => ['#e5e7eb','#ef4444','#f0a500','#3b82f6','#22c55e'][passwordStrength.value])
const strengthLabel  = computed(() => ['','Débil','Regular','Buena','Muy fuerte'][passwordStrength.value])

function validate() {
  Object.keys(errors).forEach(k => errors[k] = '')
  let ok = true
  if (!form.firstName) { errors.firstName = 'Requerido'; ok = false }
  if (!form.lastName)  { errors.lastName  = 'Requerido'; ok = false }
  if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) { errors.email = 'Correo inválido'; ok = false }
  if (!form.phone)     { errors.phone = 'Requerido'; ok = false }
  if (form.password.length < 8) { errors.password = 'Mínimo 8 caracteres'; ok = false }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  globalError.value = ''
  try {
    // 🔌 Conecta tu API aquí: await authStore.register(form)
    await new Promise(r => setTimeout(r, 1200))
    router.push('/login')
  } catch (e) {
    globalError.value = 'Error al crear la cuenta. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.field-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4b5563;
  margin-bottom: 0.375rem;
}
.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
  pointer-events: none;
}
.field-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 0.875rem;
  color: #1f2937;
  transition: all 0.15s;
  outline: none;
  font-family: 'Sora', sans-serif;
}
.field-input:focus {
  border-color: #c0392b;
  box-shadow: 0 0 0 3px rgba(192,57,43,0.1);
  background: white;
}
.field-input.error {
  border-color: #f87171;
  background: #fef2f2;
}
.field-error {
  font-size: 0.7rem;
  color: #c0392b;
  margin-top: 0.25rem;
}
</style>
