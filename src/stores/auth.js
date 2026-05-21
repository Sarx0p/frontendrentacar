import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token   = ref(localStorage.getItem('token') || sessionStorage.getItem('token') || null)
  const user    = ref(JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(correo, password, remember = false) {
    const res = await api.post('/auth/login', { correo, password })

    const data = res.data

    token.value = data.access_token
    user.value  = data.user

    const storage = remember ? localStorage : sessionStorage
    storage.setItem('token', data.access_token)
    storage.setItem('user',  JSON.stringify(data.user))
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {}
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
  }

  async function me() {
    const res = await api.get('/auth/me')
    user.value = res.data
  }

  return { token, user, isAuthenticated, login, logout, me }
})
