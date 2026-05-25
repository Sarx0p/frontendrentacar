<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-950' : 'bg-gray-50'">
    <div class="flex items-center gap-3 mb-6">
      <button
        type="button"
        @click="volver"
        class="w-10 h-10 rounded-xl flex items-center justify-center border transition-all hover:shadow-sm"
        :class="
          isDark
            ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        "
        title="Volver"
      >
        <i class="pi pi-arrow-left text-sm"></i>
      </button>
      <div>
        <h1 class="text-2xl font-extrabold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">
          Nueva reserva
        </h1>
        <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          Completa los datos para registrar la reserva
        </p>
      </div>
    </div>

    <div
      class="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-5 items-start"
    >
      <div class="space-y-5 order-2 lg:order-1">
        <ReservaClienteBuscar
          v-model:busqueda="busquedaCliente"
          :cliente-seleccionado="clienteSeleccionado"
          :resultados="resultadosClientes"
          :buscando="buscandoClientes"
          @buscar="onBuscarCliente"
          @seleccionar="seleccionarCliente"
          @limpiar="limpiarCliente"
          @agregar-nuevo="modalClienteAbierto = true"
        />

        <ReservaFechas
          v-if="clienteSeleccionado"
          v-model:fecha-inicio="fechaInicio"
          v-model:fecha-fin="fechaFin"
          v-model:tipo-reserva="tipoReserva"
          :hoy="hoy"
          :error-inicio="errorFechaInicio"
          :error-fin="errorFechaFin"
          :dias-reserva="diasReserva"
          :tipo-reserva="tipoReserva"
          @change="onFechasChange"
        />

        <ReservaVehiculosDisponibles
          v-if="clienteSeleccionado"
          :fecha-inicio="fechaInicio"
          :fecha-fin="fechaFin"
          :vehiculos="vehiculosDisponibles"
          :vehiculo-seleccionado="vehiculoSeleccionado"
          :cargando="cargandoVehiculos"
          :consultados="vehiculosConsultados"
          @consultar="consultarVehiculos"
          @seleccionar="seleccionarVehiculo"
        />

        <p v-if="errorGlobal" class="text-sm text-center font-medium" style="color: #c0392b">
          {{ errorGlobal }}
        </p>
      </div>

      <div class="order-1 lg:order-2">
        <ReservaResumen
          :cliente="clienteSeleccionado"
          :fecha-inicio="fechaInicio"
          :fecha-fin="fechaFin"
          :vehiculo="vehiculoSeleccionado"
          :dias-reserva="diasReserva"
          :tipo-reserva="tipoReservaLabel"
          :precio-estimado="precioEstimado"
          :puede-confirmar="puedeConfirmar"
          :creando="creando"
          @confirmar="confirmarReserva"
        />
      </div>
    </div>

    <ClientesModal
      :visible="modalClienteAbierto"
      :modo-edicion="false"
      :cliente="null"
      @guardar="onClienteCreado"
      @cerrar="modalClienteAbierto = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import ClientesModal from "@/components/clientes/ClientesModal.vue";
import ReservaClienteBuscar from "@/components/reservas/ReservaClienteBuscar.vue";
import ReservaFechas from "@/components/reservas/ReservaFechas.vue";
import ReservaVehiculosDisponibles from "@/components/reservas/ReservaVehiculosDisponibles.vue";
import ReservaResumen from "@/components/reservas/ReservaResumen.vue";
import { useClientesStore } from "@/stores/clientes";
import { useReservasStore } from "@/stores/reservas";
import { useAppTheme } from "@/composables/useAppTheme";

const router = useRouter();
const { isDark } = useAppTheme();
const clientesStore = useClientesStore();
const reservasStore = useReservasStore();

const clienteSeleccionado = ref(null);
const busquedaCliente = ref("");
const resultadosClientes = ref([]);
const buscandoClientes = ref(false);
const modalClienteAbierto = ref(false);
let debounceTimer = null;

const fechaInicio = ref("");
const fechaFin = ref("");
const tipoReserva = ref("");
const errorFechaInicio = ref("");
const errorFechaFin = ref("");

const vehiculosDisponibles = ref([]);
const vehiculoSeleccionado = ref(null);
const cargandoVehiculos = ref(false);
const vehiculosConsultados = ref(false);

const errorGlobal = ref("");
const creando = ref(false);

const hoy = computed(() => new Date().toISOString().split("T")[0]);

watch(fechaInicio, (val) => {
  if (!val) {
    tipoReserva.value = "";
    return;
  }
  tipoReserva.value = val <= hoy.value ? "INMEDIATA" : "ANTISIPADA";
});

const diasReserva = computed(() => {
  if (!fechaInicio.value || !fechaFin.value) return 0;
  const d1 = new Date(fechaInicio.value + "T00:00:00");
  const d2 = new Date(fechaFin.value + "T00:00:00");
  return Math.max(1, Math.round((d2 - d1) / 86400000) + 1);
});

const tipoReservaLabel = computed(() => {
  if (tipoReserva.value === "INMEDIATA") return "Inmediata";
  if (tipoReserva.value === "ANTISIPADA") return "Anticipada";
  return "—";
});

const precioEstimado = computed(() => {
  const precio = vehiculoSeleccionado.value?.categoria?.precio_dia;
  if (!precio) return null;
  return Number(precio) * diasReserva.value;
});

const puedeConfirmar = computed(
  () =>
    !!clienteSeleccionado.value &&
    !!fechaInicio.value &&
    !!fechaFin.value &&
    !!tipoReserva.value &&
    !!vehiculoSeleccionado.value &&
    !errorFechaInicio.value &&
    !errorFechaFin.value,
);

function onBuscarCliente() {
  clearTimeout(debounceTimer);
  if (!busquedaCliente.value.trim()) {
    resultadosClientes.value = [];
    return;
  }
  debounceTimer = setTimeout(async () => {
    buscandoClientes.value = true;
    resultadosClientes.value = await clientesStore.buscarClientes(busquedaCliente.value);
    buscandoClientes.value = false;
  }, 300);
}

function seleccionarCliente(c) {
  clienteSeleccionado.value = c;
  busquedaCliente.value = c.nombre;
  resultadosClientes.value = [];
  errorGlobal.value = "";
}

function limpiarCliente() {
  clienteSeleccionado.value = null;
  busquedaCliente.value = "";
  resultadosClientes.value = [];
  fechaInicio.value = "";
  fechaFin.value = "";
  tipoReserva.value = "";
  vehiculosDisponibles.value = [];
  vehiculoSeleccionado.value = null;
  vehiculosConsultados.value = false;
}

async function onClienteCreado(form) {
  try {
    const creado = await clientesStore.crear(form);
    seleccionarCliente(creado);
    modalClienteAbierto.value = false;
  } catch (e) {
    await Swal.fire({
      icon: "error",
      title: "Error al registrar cliente",
      text: e.response?.data?.message || clientesStore.error || "No se pudo registrar el cliente.",
      confirmButtonColor: "#c0392b",
      background: isDark.value ? "#1f2937" : "#fff",
      color: isDark.value ? "#f3f4f6" : "#111827",
    });
  }
}

function onFechasChange() {
  errorFechaInicio.value = "";
  errorFechaFin.value = "";
  vehiculosConsultados.value = false;
  vehiculosDisponibles.value = [];
  vehiculoSeleccionado.value = null;
}

function validarFechas() {
  errorFechaInicio.value = "";
  errorFechaFin.value = "";
  if (!fechaInicio.value) {
    errorFechaInicio.value = "Requerido";
    return false;
  }
  if (!fechaFin.value) {
    errorFechaFin.value = "Requerido";
    return false;
  }
  if (fechaInicio.value < hoy.value) {
    errorFechaInicio.value = "No puede ser anterior a hoy.";
    return false;
  }
  if (fechaFin.value < fechaInicio.value) {
    errorFechaFin.value = "Debe ser posterior al inicio.";
    return false;
  }
  return true;
}

async function consultarVehiculos() {
  if (!validarFechas()) return;
  errorGlobal.value = "";
  cargandoVehiculos.value = true;
  vehiculosConsultados.value = false;
  vehiculoSeleccionado.value = null;
  try {
    vehiculosDisponibles.value = await reservasStore.fetchVehiculosDisponibles(
      fechaInicio.value,
      fechaFin.value,
    );
    vehiculosConsultados.value = true;
  } catch (e) {
    errorGlobal.value = e.response?.data?.message || "No se pudieron consultar los vehículos.";
    vehiculosDisponibles.value = [];
  } finally {
    cargandoVehiculos.value = false;
  }
}

function seleccionarVehiculo(v) {
  vehiculoSeleccionado.value = v;
  errorGlobal.value = "";
}

async function confirmarReserva() {
  if (!clienteSeleccionado.value) {
    errorGlobal.value = "Selecciona un cliente.";
    return;
  }
  if (!validarFechas()) return;
  if (!tipoReserva.value) {
    errorGlobal.value = "Selecciona el tipo de reserva.";
    return;
  }
  if (!vehiculoSeleccionado.value) {
    errorGlobal.value = "Selecciona un vehículo.";
    return;
  }

  creando.value = true;
  errorGlobal.value = "";
  try {
    await reservasStore.crear({
      cliente_id: clienteSeleccionado.value.id,
      vehiculo_id: vehiculoSeleccionado.value.id,
      fecha_inicio: fechaInicio.value,
      fecha_fin: fechaFin.value,
      tipo_reserva: tipoReserva.value,
    });
    await Swal.fire({
      icon: "success",
      title: "¡Reserva creada!",
      text: "La reserva se registró correctamente.",
      confirmButtonColor: "#c0392b",
      confirmButtonText: "Ver reservas",
      background: isDark.value ? "#1f2937" : "#fff",
      color: isDark.value ? "#f3f4f6" : "#111827",
    });
    router.push({ name: "reservas" });
  } catch (e) {
    if (e.response?.status === 401) {
      await Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text: "Tu sesión ya no es válida. Inicia sesión de nuevo.",
        confirmButtonColor: "#c0392b",
        background: isDark.value ? "#1f2937" : "#fff",
        color: isDark.value ? "#f3f4f6" : "#111827",
      });
      return;
    }
    const msg = e.response?.data?.message || reservasStore.error || "No se pudo crear la reserva.";
    await Swal.fire({
      icon: "error",
      title: "Error al crear reserva",
      text: msg,
      confirmButtonColor: "#c0392b",
      background: isDark.value ? "#1f2937" : "#fff",
      color: isDark.value ? "#f3f4f6" : "#111827",
    });
  } finally {
    creando.value = false;
  }
}

function volver() {
  router.push({ name: "reservas" });
}
</script>
