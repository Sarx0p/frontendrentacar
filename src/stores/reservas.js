import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";

function extractList(responseData) {
  const payload = responseData?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export const useReservasStore = defineStore("reservas", () => {
  const reservas = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchReservas(params = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/admin/reservas", { params });
      reservas.value = extractList(res.data);
    } catch {
      error.value = "Error al cargar reservas.";
      reservas.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function crear(form) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post("/admin/reservas", form);
      reservas.value.unshift(res.data.data);
      return res.data.data;
    } catch (e) {
      const errs = e.response?.data?.errors;
      const firstErr = errs && typeof errs === "object" ? Object.values(errs).flat()[0] : null;
      error.value = firstErr || e.response?.data?.message || "Error al crear la reserva.";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchVehiculosDisponibles(fechaInicio, fechaFin, reservaId = null) {
    if (!fechaInicio || !fechaFin) return [];
    try {
      const params = { fecha_inicio: fechaInicio, fecha_fin: fechaFin, estado: "DISPONIBLE" };
      if (reservaId) params.reserva_id = reservaId;
      const res = await api.get("/admin/vehiculos", { params });
      return extractList(res.data);
    } catch (e) {
      if (e.response?.status === 404) return [];
      throw e;
    }
  }

  async function fetchReserva(id) {
    const res = await api.get(`/admin/reservas/${id}`);
    return res.data.data;
  }

  async function actualizar(id, form) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.put(`/admin/reservas/${id}`, form);
      const actualizada = res.data.data;
      const idx = reservas.value.findIndex((r) => r.id === id);
      if (idx !== -1) reservas.value[idx] = actualizada;
      return actualizada;
    } catch (e) {
      const errs = e.response?.data?.errors;
      const firstErr = errs && typeof errs === "object" ? Object.values(errs).flat()[0] : null;
      error.value = firstErr || e.response?.data?.message || "Error al actualizar la reserva.";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchReservasActivasCliente(cliente) {
    const clienteId = typeof cliente === "object" ? cliente?.id : cliente;
    const search = typeof cliente === "object"
      ? (cliente?.dui || cliente?.nombre || clienteId)
      : clienteId;

    const res = await api.get("/admin/reservas", {
      params: {
        search,
        per_page: 100,
      },
    });
    return extractList(res.data).filter(
      (reserva) => Number(reserva.cliente_id || reserva.cliente?.id) === Number(clienteId)
        && !["CANCELADA", "FINALIZADA"].includes(reserva.estado)
        && !reserva.contrato,
    );
  }

  async function cancelar(id, motivo) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post("/admin/cancelaciones", { reserva_id: id, motivo });
      const actualizada = res.data?.data?.reserva || res.data?.data;
      const idx = reservas.value.findIndex((r) => r.id === id);
      if (idx !== -1 && actualizada?.id) reservas.value[idx] = actualizada;
      return actualizada;
    } catch (e) {
      const errs = e.response?.data?.errors;
      const firstErr = errs && typeof errs === "object" ? Object.values(errs).flat()[0] : null;
      error.value = firstErr || e.response?.data?.message || "Error al cancelar la reserva.";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCancelaciones(params = {}) {
    const res = await api.get("/admin/cancelaciones", {
      params: { per_page: 50, ...params },
    });
    return extractList(res.data);
  }

  return {
    reservas,
    loading,
    error,
    fetchReservas,
    fetchReserva,
    crear,
    actualizar,
    fetchVehiculosDisponibles,
    fetchReservasActivasCliente,
    cancelar,
    fetchCancelaciones,
  };
});
