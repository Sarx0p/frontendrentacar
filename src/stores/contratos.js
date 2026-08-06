import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useContratosStore = defineStore('contratos', () => {
  const contratos = ref([])
  const loading   = ref(false)
  const error     = ref(null)

  async function fetchContratos(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.get('/admin/contratos', { params })
      const payload = res.data?.data
      contratos.value = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : [])
    } catch {
      error.value = 'Error al cargar contratos.'
      contratos.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchContrato(id) {
    const res = await api.get(`/admin/contratos/${id}`)
    return res.data.data
  }

  async function crear(form) {
    loading.value = true
    error.value   = null
    try {
      const endpoint = form.reserva_id ? '/admin/contratos' : '/admin/contratos/directo'
      const res = await api.post(endpoint, form)
      contratos.value.unshift(res.data.data)
      return res.data.data
    } catch (e) {
      const errs = e.response?.data?.errors
      const firstErr = errs && typeof errs === 'object' ? Object.values(errs).flat()[0] : null
      error.value = firstErr || e.response?.data?.message || 'Error al generar el contrato.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function cerrarRenta(contratoId, form) {
    const res = await api.post(`/admin/contratos/${contratoId}/cierre`, form)
    const idx = contratos.value.findIndex((c) => c.id === Number(contratoId))
    if (idx !== -1 && res.data.data?.contrato) {
      contratos.value[idx] = res.data.data.contrato
    }
    return res.data.data
  }

  async function syncCargos(contratoId, cargos) {
    const res = await api.post(`/admin/contratos/${contratoId}/cargos`, { cargos })
    return res.data.data
  }

  return { contratos, loading, error, fetchContratos, fetchContrato, crear, cerrarRenta, syncCargos }
})
