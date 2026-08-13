import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useMantenimientosStore = defineStore('mantenimientos', () => {
  const mantenimientos = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchMantenimientos(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/admin/mantenimientos', { params })
      mantenimientos.value = res.data.data.data ?? res.data.data ?? []
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al cargar mantenimientos.'
      mantenimientos.value = []
    } finally {
      loading.value = false
    }
  }

  async function crear(form) {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('/admin/mantenimientos', form)
      const nuevo = res.data.data
      mantenimientos.value.unshift(nuevo)
      return nuevo
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al registrar el mantenimiento.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function actualizar(id, form) {
    loading.value = true
    error.value = null
    try {
      const res = await api.put(`/admin/mantenimientos/${id}`, form)
      const actualizado = res.data.data
      const idx = mantenimientos.value.findIndex((m) => m.id === id)
      if (idx !== -1) mantenimientos.value[idx] = actualizado
      return actualizado
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al actualizar el mantenimiento.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function eliminar(id) {
    loading.value = true
    error.value = null
    try {
      const res = await api.delete(`/admin/mantenimientos/${id}`)
      const actualizado = res.data.data
      const idx = mantenimientos.value.findIndex((m) => m.id === id)
      if (idx !== -1 && actualizado) {
        mantenimientos.value[idx] = actualizado
      }
      return actualizado
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al anular el mantenimiento.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { mantenimientos, loading, error, fetchMantenimientos, crear, actualizar, eliminar }
})
