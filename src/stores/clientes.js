import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

function paginatedData(payload) {
  const data = payload?.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

function normalizeCliente(cliente) {
  if (!cliente) return cliente

  const municipio = cliente.municipio
  const departamento = municipio?.departamento

  return {
    ...cliente,
    municipio_id: cliente.municipio_id ?? municipio?.id ?? '',
    departamento_id: cliente.departamento_id ?? municipio?.departamento_id ?? departamento?.id ?? '',
    municipio_nombre: typeof municipio === 'object' ? municipio?.nombre : municipio,
    departamento_nombre: typeof departamento === 'object' ? departamento?.nombre : cliente.departamento,
  }
}

export const useClientesStore = defineStore('clientes', () => {

  const clientes = ref([])
  const departamentos = ref([])
  const loading  = ref(false)
  const error    = ref(null)

  const total = computed(() => clientes.value.length)

  async function fetchClientes() {
    loading.value = true
    error.value   = null
    try {
      const res = await api.get('/admin/clientes')
      clientes.value = paginatedData(res.data).map(normalizeCliente)
    } catch {
      error.value = 'Error al cargar clientes.'
    } finally {
      loading.value = false
    }
  }

  async function fetchDepartamentos() {
    if (departamentos.value.length) return departamentos.value

    const res = await api.get('/admin/departamentos')
    departamentos.value = Array.isArray(res.data?.data) ? res.data.data : []
    return departamentos.value
  }

  async function fetchMunicipios(departamentoId) {
    if (!departamentoId) return []

    const res = await api.get(`/admin/departamentos/${departamentoId}/municipios`)
    return Array.isArray(res.data?.data) ? res.data.data : []
  }

  async function crear(form) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.post('/admin/clientes', form)
      const cliente = normalizeCliente(res.data.data)
      clientes.value.unshift(cliente)
      return cliente
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
      const res = await api.get('/admin/clientes', { params: { search: term.trim() } })
      return paginatedData(res.data).map(normalizeCliente)
    } catch {
      return []
    }
  }

  async function actualizar(form) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.put(`/admin/clientes/${form.id}`, form)
      const cliente = normalizeCliente(res.data.data)
      const idx = clientes.value.findIndex(c => c.id === form.id)
      if (idx !== -1) clientes.value[idx] = cliente
      return cliente
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al actualizar cliente.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchHistorial(clienteId) {
    error.value = null
    try {
      const res = await api.get(`/admin/clientes/${clienteId}/historial`)
      return res.data.data
    } catch (e) {
      if (e.response?.status === 404) {
        return {
          disponible: false,
          cliente: null,
          reservas: [],
          contratos: [],
          incidentes: [],
        }
      }
      error.value = e.response?.data?.message || 'Error al cargar historial.'
      throw e
    }
  }

  return {
    clientes,
    departamentos,
    loading,
    error,
    total,
    fetchClientes,
    fetchDepartamentos,
    fetchMunicipios,
    buscarClientes,
    crear,
    actualizar,
    fetchHistorial,
  }
})
