import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const AUTH_STORAGE_KEY = 'rentacar-auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  function hydrate() {
    token.value =
      localStorage.getItem(AUTH_STORAGE_KEY) ||
      sessionStorage.getItem(AUTH_STORAGE_KEY)
  }

  function login(remember = false) {
    const value = `session-${Date.now()}`
    token.value = value
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    if (remember) {
      localStorage.setItem(AUTH_STORAGE_KEY, value)
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, value)
    }
  }

  function logout() {
    token.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
  }

  hydrate()

  return { token, isAuthenticated, login, logout, hydrate }
})
