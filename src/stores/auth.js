import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { getToken, saveSession, clearSession } from '@/services/authToken'

function loadUser() {
  const raw = localStorage.getItem('user') || sessionStorage.getItem('user')
  if (!raw || raw === 'null') return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken())
  const user  = ref(loadUser())

  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(correo, password, remember = false) {
    const res = await api.post('/auth/login', { correo, password })

    const data = res.data

    token.value = data.access_token
    user.value  = data.user

    saveSession(data.access_token, data.user, remember)
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignorar si el token ya expiró
    }
    token.value = null
    user.value  = null
    clearSession()
  }

  async function me() {
    const res = await api.get('/auth/me')
    user.value = res.data
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage
    storage.setItem('user', JSON.stringify(res.data))
  }

  return { token, user, isAuthenticated, login, logout, me }
})
