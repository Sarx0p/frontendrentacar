import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRoute = error.config.url.includes('auth/login')
      if (!isLoginRoute) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('auth')
        router.push('/login')
      }
    }
    return Promise.reject(error) // ← fuera del if
  }
)

export default api
