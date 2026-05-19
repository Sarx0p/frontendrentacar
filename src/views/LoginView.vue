<template>
  <div class="min-h-screen flex" style="font-family: 'Sora', sans-serif;">


    <div class="flex-1 flex items-center justify-center bg-gray-50 p-6">
      <div class="w-full max-w-md">

        <div class="flex lg:hidden items-center gap-3 mb-8">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:#c0392b;">
            <i class="pi pi-car text-white"></i>
          </div>
         
        </div>

        <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/80 p-8 border border-gray-100">
          <h2 class="text-2xl font-extrabold text-gray-900 mb-1">Iniciar sesión</h2>
          <p class="text-sm text-gray-500 mb-8">Ingresa tus credenciales para continuar</p>

          <form @submit.prevent="handleLogin" class="space-y-5">

            <!-- coso de correo -->
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                Correo electrónico
              </label>
              <div class="relative">
                <i class="pi pi-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="user@gmail.com"
                  required
                  class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  style="focus-ring-color:#c0392b;"
                  :class="errors.email ? 'border-red-400 bg-red-50' : ''"
                />
              </div>
              <p v-if="errors.email" class="text-xs mt-1" style="color:#c0392b;">{{ errors.email }}</p>
            </div>

            <!-- contraseña -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest">Contraseña</label>
                <router-link to="/forgot-password" class="text-xs font-medium hover:underline" style="color:#c0392b;">
                  ¿Olvidaste tu contraseña?
                </router-link>
              </div>
              <div class="relative">
                <i class="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  class="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  :class="errors.password ? 'border-red-400 bg-red-50' : ''"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
                </button>
              </div>
              <p v-if="errors.password" class="text-xs mt-1" style="color:#c0392b;">{{ errors.password }}</p>
            </div>


            <!-- error -->
            <div v-if="globalError" class="flex items-center gap-2 p-3 rounded-xl text-sm" style="background:#fef2f2; color:#c0392b; border:1px solid #fecaca;">
              <i class="pi pi-exclamation-circle"></i>
              {{ globalError }}
            </div>

            <!-- darle al boton -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style="background:#c0392b;"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-sign-in"></i>
              {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
            </button>
          </form>

          <div class="flex items-center gap-3 my-6">
            <div class="flex-1 h-px bg-gray-200"></div>
            <span class="text-xs text-gray-400">¿No tienes cuenta?</span>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>

          <router-link
            to="/register"
            class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 transition-all duration-150 hover:bg-gray-50"
            style="border-color:#c0392b; color:#c0392b;"
          >
            <i class="pi pi-user-plus"></i>
            Crear cuenta nueva
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const errors = reactive({ email: '', password: '' })
const globalError = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  errors.email = ''
  errors.password = ''
  globalError.value = ''

  // validacin
  if (!form.email) { errors.email = 'El correo es requerido.'; return }
  if (!form.password) { errors.password = 'La contraseña es requerida.'; return }

  loading.value = true
  try {
    //falta de auth y api
    await new Promise(r => setTimeout(r, 1200))
    router.push('/dashboard')
  } catch (e) {
    globalError.value = 'Credenciales incorrectas. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');

input:focus {
  ring-color: #c0392b;
  border-color: #c0392b;
}
</style>
