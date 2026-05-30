import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const usePagosStore = defineStore('pagos', () => {
  const pagos   = ref([])
  const loading = ref(false)
  const error   = ref(null)

  async function fetchPagos(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.get('/admin/pagos', { params })
      pagos.value = res.data.data.data
    } catch {
      error.value = 'Error al cargar pagos.'
    } finally {
      loading.value = false
    }
  }

  async function registrar(contratoId, form) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.post(`/admin/contratos/${contratoId}/pagos`, form)
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al registrar el pago.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { pagos, loading, error, fetchPagos, registrar }
})
