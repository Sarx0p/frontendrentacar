import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useClientesStore = defineStore('clientes', () => {

  const clientes = ref([])
  const loading  = ref(false)
  const error    = ref(null)

  const total = computed(() => clientes.value.length)

  async function fetchClientes() {
    loading.value = true
    error.value   = null
    try {
      const res = await api.get('/admin/clientes')
      clientes.value = res.data.data.data
    } catch (e) {
      error.value = 'Error al cargar clientes.'
    } finally {
      loading.value = false
    }
  }

  async function crear(form) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.post('/admin/clientes', form)
      clientes.value.unshift(res.data.data)
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al crear cliente.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function buscarClientes(term) {
    if (!term?.trim()) return []
    try {
      const res = await api.get('/admin/clientes', { params: { buscar: term.trim() } })
      return res.data.data.data ?? []
    } catch {
      return []
    }
  }

  async function actualizar(form) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.put(`/admin/clientes/${form.id}`, form)
      const idx = clientes.value.findIndex(c => c.id === form.id)
      if (idx !== -1) clientes.value[idx] = res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al actualizar cliente.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { clientes, loading, error, total, fetchClientes, buscarClientes, crear, actualizar }
})
