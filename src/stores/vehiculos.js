import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useVehiculosStore = defineStore('vehiculos', () => {
  const vehiculos = ref([])
  const loading = ref(false)
  const error = ref(null)
  const estadosOpciones = ref([])

  async function fetchVehiculos(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/admin/vehiculos', { params })
      vehiculos.value = res.data.data.data ?? res.data.data ?? []
      estadosOpciones.value = res.data.meta?.estados ?? []
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al cargar vehículos.'
      vehiculos.value = []
    } finally {
      loading.value = false
    }
  }

  async function crear(form) {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('/admin/vehiculos', form)
      vehiculos.value.unshift(res.data.data)
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al crear vehículo.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function actualizar(form) {
    loading.value = true
    error.value = null
    try {
      const res = await api.put(`/admin/vehiculos/${form.id}`, form)
      const idx = vehiculos.value.findIndex((v) => v.id === form.id)
      if (idx !== -1) vehiculos.value[idx] = res.data.data
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al actualizar vehículo.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { vehiculos, loading, error, estadosOpciones, fetchVehiculos, crear, actualizar }
})
