import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useUsuariosStore = defineStore('usuarios', () => {

  const usuarios = ref([])
  const loading  = ref(false)
  const error    = ref(null)

  const total = computed(() => usuarios.value.length)

  async function fetchUsuarios() {
    loading.value = true
    error.value   = null
    try {
      const res = await api.get('/admin/usuarios')
      usuarios.value = res.data.data.data
    } catch {
      error.value = 'Error al cargar usuarios.'
    } finally {
      loading.value = false
    }
  }

  async function crear(form) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.post('/admin/usuarios', {
        nombre:   form.nombre,
        apellido: form.apellido,
        correo:   form.correo,
        password: form.password,
        rol:      form.rol,
      })
      usuarios.value.unshift(res.data.data)
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al crear usuario.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function actualizar(form) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.put(`/admin/usuarios/${form.id}`, {
        nombre:   form.nombre,
        apellido: form.apellido,
        correo:   form.correo,
        rol:      form.rol,
      })
      const idx = usuarios.value.findIndex(u => u.id === form.id)
      if (idx !== -1) usuarios.value[idx] = res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al actualizar usuario.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    error.value = null
    try {
      const res = await api.delete(`/admin/usuarios/${id}`, {
        data: { estado: nuevoEstado }
      })
      const idx = usuarios.value.findIndex(u => u.id === id)
      if (idx !== -1) usuarios.value[idx].estado = res.data.data.estado
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al cambiar estado.'
    }
  }

  return { usuarios, loading, error, total, fetchUsuarios, crear, actualizar, cambiarEstado }
})
