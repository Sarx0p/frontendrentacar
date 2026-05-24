import axios from 'axios'
import router from '@/router'
import { getToken, saveToken, clearSession } from '@/services/authToken'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let pendingRequests = []

function flushQueue(error, token = null) {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  pendingRequests = []
}

async function clearSessionAndRedirect() {
  clearSession()
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()
  authStore.$patch({ token: null, user: null })

  if (router.currentRoute.value.name !== 'login') {
    router.push({
      name: 'login',
      query: { redirect: router.currentRoute.value.fullPath },
    })
  }
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    const status = response?.status
    const url = config?.url || ''

    if (status !== 401 || url.includes('auth/login')) {
      return Promise.reject(error)
    }

    if (url.includes('auth/refresh') || config._retry) {
      await clearSessionAndRedirect()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (newToken) => {
            config.headers.Authorization = `Bearer ${newToken}`
            resolve(api(config))
          },
          reject,
        })
      })
    }

    config._retry = true
    isRefreshing = true

    try {
      const token = getToken()
      if (!token) throw error

      const refreshRes = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      )

      const newToken = refreshRes.data.access_token
      const user = refreshRes.data.user

      saveToken(newToken, user)

      const { useAuthStore } = await import('@/stores/auth')
      useAuthStore().$patch({ token: newToken, user })

      flushQueue(null, newToken)

      config.headers.Authorization = `Bearer ${newToken}`
      return api(config)
    } catch (refreshError) {
      flushQueue(refreshError, null)
      await clearSessionAndRedirect()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
