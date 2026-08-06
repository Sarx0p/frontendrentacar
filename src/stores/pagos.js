import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

function extractList(responseData) {
  const payload = responseData?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const usePagosStore = defineStore('pagos', () => {
  const pagos   = ref([])
  const loading = ref(false)
  const error   = ref(null)

  async function fetchPagos(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.get('/admin/pagos', { params })
      pagos.value = extractList(res.data)
    } catch {
      error.value = 'Error al cargar pagos.'
      pagos.value = []
    } finally {
      loading.value = false
    }
  }

  async function registrar(contratoId, form) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.post('/admin/pagos', {
        contrato_id: contratoId,
        ...form,
      })
      return res.data.data
    } catch (e) {
      const errs = e.response?.data?.errors
      const firstErr = errs && typeof errs === 'object' ? Object.values(errs).flat()[0] : null
      error.value = firstErr || e.response?.data?.message || 'Error al registrar el pago.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { pagos, loading, error, fetchPagos, registrar }
})
