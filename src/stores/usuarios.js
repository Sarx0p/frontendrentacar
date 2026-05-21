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
      // respuesta paginada: { status, data: { data: [...], total, ... } }
      usuarios.value = res.data.data.data
    } catch (e) {
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
        correo:   form.email,
        password: form.password,
        rol:      form.rol.toUpperCase(),
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
        correo:   form.email,
        rol:      form.rol.toUpperCase(),
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

  async function eliminar(id) {
    loading.value = true
    error.value   = null
    try {
      await api.delete(`/admin/usuarios/${id}`)
      usuarios.value = usuarios.value.filter(u => u.id !== id)
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al eliminar usuario.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function toggleEstado(usuario) {
    error.value = null
    try {
      const nuevoEstado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
      await api.put(`/admin/usuarios/${usuario.id}`, { estado: nuevoEstado })
      const idx = usuarios.value.findIndex(u => u.id === usuario.id)
      if (idx !== -1) usuarios.value[idx].estado = nuevoEstado
    } catch (e) {
      error.value = e.response?.data?.message || 'Error al cambiar estado.'
    }
  }

  return { usuarios, loading, error, total, fetchUsuarios, crear, actualizar, eliminar, toggleEstado }
})
