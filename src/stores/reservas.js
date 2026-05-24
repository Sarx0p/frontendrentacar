import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useReservasStore = defineStore('reservas', () => {
  const reservas = ref([])
  const loading  = ref(false)
  const error    = ref(null)

  async function fetchReservas(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.get('/admin/reservas', { params })
      reservas.value = res.data.data.data
    } catch (e) {
      error.value = 'Error al cargar reservas.'
    } finally {
      loading.value = false
    }
  }

  async function crear(form) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.post('/admin/reservas', form)
      reservas.value.unshift(res.data.data)
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al crear la reserva.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchVehiculosDisponibles(fechaInicio, fechaFin) {
    const res = await api.get('/admin/vehiculos/disponibles', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    })
    return res.data.data
  }

  return { reservas, loading, error, fetchReservas, crear, fetchVehiculosDisponibles }
})
