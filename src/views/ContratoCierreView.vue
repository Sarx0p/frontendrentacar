<template>
  <div class="cierre-root" :class="isDark ? 'cierre-root--dark' : 'cierre-root--light'">
    <header class="cierre-header">
      <button type="button" class="cierre-back" @click="router.push({ name: 'contratos' })">
        <i class="pi pi-arrow-left"></i>
      </button>
      <div class="flex-1 min-w-0">
        <p class="cierre-kicker">Finalizacion de renta</p>
        <h1 class="cierre-title">Cierre de renta</h1>
      </div>
      <span v-if="contrato" class="cierre-badge">{{ contrato.numero_contrato }}</span>
    </header>

    <div v-if="cargando" class="cierre-loading">
      <i class="pi pi-spin pi-spinner text-xl"></i>
      <span>Cargando contrato...</span>
    </div>

    <div v-else-if="contrato" class="cierre-layout">
      <div class="cierre-main">
        <div class="cierre-info-banner">
          <div v-for="info in infoContrato" :key="info.label" class="cierre-info-item">
            <i :class="['pi', info.icon]"></i>
            <div>
              <p class="cierre-info-label">{{ info.label }}</p>
              <p class="cierre-info-value">{{ info.value }}</p>
            </div>
          </div>
        </div>

        <section class="cierre-card">
          <div class="cierre-card-head">
            <span class="cierre-step">1</span>
            <h2>Inspeccion del vehiculo</h2>
          </div>
          <div class="cierre-field">
            <label>Observaciones de entrega</label>
            <div class="cierre-readonly">
              {{ contrato.observaciones_entrega || "Sin observaciones registradas en la entrega." }}
            </div>
          </div>
          <div class="cierre-field">
            <label>Estado y observaciones al recibir</label>
            <textarea
              v-model="observacionesRecepcion"
              rows="3"
              class="cierre-input"
              placeholder="Describe rayones, golpes, limpieza u otros detalles..."
            ></textarea>
          </div>
        </section>

        <div class="cierre-grid-2">
          <section class="cierre-card">
            <div class="cierre-card-head">
              <span class="cierre-step">2</span>
              <h2>Combustible</h2>
            </div>
            <div class="cierre-fuel-row">
              <div class="cierre-fuel-col">
                <span class="cierre-fuel-tag">Entrega</span>
                <span class="cierre-fuel-val cierre-fuel-val--red">{{ entregaLabel }}</span>
                <div class="cierre-fuel-meter cierre-fuel-meter--readonly" :style="{ '--fuel-fill': `${pctEntrega}%` }">
                  <div class="cierre-fuel-fill"></div>
                </div>
              </div>
              <div class="cierre-fuel-col">
                <span class="cierre-fuel-tag">Recepcion</span>
                <span class="cierre-fuel-val cierre-fuel-val--gold">{{ combLabel }}</span>
                <div class="cierre-fuel-meter" :style="{ '--fuel-fill': `${pctRecepcion}%` }">
                  <div class="cierre-fuel-fill"></div>
                  <button
                    v-for="nivel in NIVELES_COMBUSTIBLE"
                    :key="nivel.value"
                    type="button"
                    class="cierre-fuel-point"
                    :class="{ 'cierre-fuel-point--active': nivel.value === nivelRecepcion }"
                    :style="{ left: `${nivel.pct}%` }"
                    :aria-label="`Seleccionar ${nivel.label}`"
                    @click="seleccionarCombustible(nivel.value)"
                  >
                    <span></span>
                  </button>
                </div>
                <div class="cierre-fuel-labels">
                  <button
                    v-for="nivel in NIVELES_COMBUSTIBLE"
                    :key="`fuel-label-${nivel.value}`"
                    type="button"
                    :class="{ 'cierre-fuel-label--active': nivel.value === nivelRecepcion }"
                    @click="seleccionarCombustible(nivel.value)"
                  >
                    {{ combustibleCorto(nivel) }}
                  </button>
                </div>
              </div>
            </div>
            <div v-if="alertaCombustible" class="cierre-alert">
              <i class="pi pi-exclamation-triangle"></i>
              <span>Combustible menor al entregado</span>
              <button type="button" class="cierre-alert-btn" @click="agregarCargoCombustible">
                + Cargo $10
              </button>
            </div>
          </section>

          <section class="cierre-card">
            <div class="cierre-card-head">
              <span class="cierre-step">3</span>
              <h2>Retraso</h2>
            </div>
            <div v-if="horasRetraso > 0" class="cierre-status cierre-status--warn">
              <i class="pi pi-clock"></i>
              <div class="flex-1">
                <p class="cierre-status-title">{{ horasRetraso }} hora(s) de retraso</p>
                <label class="cierre-check">
                  <input v-model="aplicarCargoRetraso" type="checkbox" />
                  <span>Aplicar cargo por retraso al cierre</span>
                </label>
                <input
                  v-if="aplicarCargoRetraso"
                  v-model.number="montoRetraso"
                  type="number"
                  min="0.01"
                  step="0.01"
                  class="cierre-input cierre-input--sm cierre-input--amount mt-2"
                />
              </div>
            </div>
            <div v-else class="cierre-status cierre-status--ok">
              <i class="pi pi-check-circle"></i>
              <p class="cierre-status-title">Devolucion a tiempo</p>
            </div>
          </section>
        </div>

        <section class="cierre-card">
          <div class="cierre-card-head">
            <span class="cierre-step">4</span>
            <h2>Cargos adicionales antes de cerrar</h2>
            <button
              type="button"
              class="cierre-add-btn"
              @click="cargos.push({ concepto: '', monto: 0, tipo_cargo: 'OTRO' })"
            >
              <i class="pi pi-plus"></i> Agregar
            </button>
          </div>
          <p class="cierre-helper">
            Si agregas cargos aqui, primero se registran y se cobran en Pagos. Luego puedes volver a
            cerrar la renta.
          </p>
          <div v-if="!cargos.length" class="cierre-empty-cargos">Sin cargos adicionales</div>
          <div v-for="(cargo, i) in cargos" :key="i" class="cierre-cargo-row">
            <select
              v-model="cargo.tipo_cargo"
              class="cierre-input cierre-input--sm cierre-input--type"
            >
              <option value="COMBUSTIBLE">Combustible</option>
              <option value="DANIO">Daño</option>
              <option value="DIA EXTRA">Dia extra</option>
              <option value="OTRO">Otro</option>
            </select>
            <input
              v-model="cargo.concepto"
              class="cierre-input cierre-input--sm"
              placeholder="Concepto del cargo"
            />
            <input
              v-model.number="cargo.monto"
              type="number"
              min="0"
              class="cierre-input cierre-input--sm cierre-input--amount"
              placeholder="0.00"
            />
            <button type="button" class="cierre-remove-btn" @click="cargos.splice(i, 1)">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <p v-if="cargos.length" class="cierre-extras-total">
            Total por registrar: <strong>${{ formatPrecio(totalExtras) }}</strong>
          </p>
        </section>
      </div>

      <aside class="cierre-ticket">
        <div class="cierre-ticket-perf"></div>
        <div class="cierre-ticket-head">
          <div class="cierre-ticket-icon"><i class="pi pi-flag"></i></div>
          <div>
            <p class="cierre-ticket-brand">Liquidacion final</p>
            <p class="cierre-ticket-sub">Revisa antes de cerrar</p>
          </div>
        </div>
        <div class="cierre-ticket-line"></div>
        <div class="cierre-ticket-rows">
          <div class="cierre-ticket-row">
            <span>Total contrato</span>
            <strong>${{ formatPrecio(contrato.monto_total_renta) }}</strong>
          </div>
          <div class="cierre-ticket-row">
            <span>Cargos por registrar</span>
            <strong class="cierre-ticket-gold">+${{ formatPrecio(totalExtras) }}</strong>
          </div>
          <div v-if="aplicarCargoRetraso" class="cierre-ticket-row">
            <span>Cargo por retraso</span>
            <strong class="cierre-ticket-gold">+${{ formatPrecio(montoRetraso) }}</strong>
          </div>
          <div v-if="pagadoContrato > 0" class="cierre-ticket-row">
            <span>Ya pagado</span>
            <strong>-${{ formatPrecio(pagadoContrato) }}</strong>
          </div>
        </div>
        <div class="cierre-ticket-total">
          <span>{{ saldoPendiente > 0 ? "Saldo pendiente" : "Estado de pago" }}</span>
          <p>{{ saldoPendiente > 0 ? `$${formatPrecio(saldoPendiente)}` : labelPagoContrato }}</p>
        </div>
        <p v-if="mensajeBloqueoCierre" class="cierre-ticket-note">{{ mensajeBloqueoCierre }}</p>
        <div class="cierre-ticket-actions">
          <button
            type="button"
            class="cierre-btn cierre-btn--outline"
            :disabled="cobrando || saldoPendiente <= 0"
            @click="irACobrarSaldo"
          >
            <i :class="cobrando ? 'pi pi-spin pi-spinner' : 'pi pi-dollar'"></i>
            Cobrar saldo
          </button>
          <button
            type="button"
            class="cierre-btn cierre-btn--primary"
            :disabled="cerrando || Boolean(mensajeBloqueoCierre)"
            @click="cerrarRenta"
          >
            <i :class="cerrando ? 'pi pi-spin pi-spinner' : 'pi pi-flag'"></i>
            Cerrar renta y liberar vehiculo
          </button>
        </div>
        <div class="cierre-ticket-perf cierre-ticket-perf--flip"></div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import { useContratosStore } from "@/stores/contratos";
import { useAppTheme } from "@/composables/useAppTheme";
import {
  NIVELES_COMBUSTIBLE,
  formatPrecio,
  formatFechaHora12,
  nivelCombustiblePct,
  nombreVehiculo,
  montoPagadoContrato,
} from "@/utils/contratoFormatters";

const route = useRoute();
const router = useRouter();
const { isDark } = useAppTheme();
const store = useContratosStore();

const contrato = ref(null);
const cargando = ref(true);
const cerrando = ref(false);
const cobrando = ref(false);
const observacionesRecepcion = ref("");
const nivelRecepcion = ref("1/2");
const cargos = ref([]);
const aplicarCargoRetraso = ref(false);
const montoRetraso = ref(15);

const combIdx = computed(() => {
  const i = NIVELES_COMBUSTIBLE.findIndex((n) => n.value === nivelRecepcion.value);
  return i >= 0 ? i : 2;
});
const combLabel = computed(() => NIVELES_COMBUSTIBLE[combIdx.value]?.label);
const entregaLabel = computed(() =>
  NIVELES_COMBUSTIBLE.find((n) => n.value === contrato.value?.nivel_combustible_entrega)?.label ||
  contrato.value?.nivel_combustible_entrega ||
  "-",
);
const pctEntrega = computed(() => nivelCombustiblePct(contrato.value?.nivel_combustible_entrega));
const pctRecepcion = computed(() => nivelCombustiblePct(nivelRecepcion.value));
const alertaCombustible = computed(() => pctRecepcion.value < pctEntrega.value);

const horasRetraso = computed(() => {
  if (!contrato.value?.fecha_hora_devolucion) return 0;
  const devolucion = new Date(contrato.value.fecha_hora_devolucion);
  const limite = new Date(devolucion.getTime() + 2 * 3600000);
  const ahora = new Date();
  if (ahora <= limite) return 0;
  return Math.max(0, Math.ceil((ahora - devolucion) / 3600000));
});

const totalExtras = computed(() => cargosValidos().reduce((s, c) => s + Number(c.monto || 0), 0));
const pagadoContrato = computed(() => montoPagadoContrato(contrato.value));
const saldoPendiente = computed(() => {
  if (!contrato.value) return 0;
  if (contrato.value.estado_pago === "PAGADO") return totalExtras.value;
  return Math.max(
    0,
    Number(contrato.value.monto_total_renta || 0) + totalExtras.value - pagadoContrato.value,
  );
});
const labelPagoContrato = computed(() =>
  contrato.value?.estado_pago === "PAGADO" ? "Pagado" : "Pendiente",
);
const mensajeBloqueoCierre = computed(() => {
  if (!contrato.value) return "No se encontro el contrato.";
  if (contrato.value.estado_contrato !== "ACTIVO")
    return "Solo se puede cerrar un contrato activo.";
  if (cargosValidos().length > 0)
    return "Hay cargos pendientes de registrar y cobrar antes del cierre.";
  if (contrato.value.estado_pago !== "PAGADO")
    return "El contrato debe estar pagado antes de cerrar la renta.";
  if (aplicarCargoRetraso.value && (!montoRetraso.value || Number(montoRetraso.value) <= 0)) {
    return "Indica un monto valido para el cargo por retraso.";
  }
  return "";
});

const infoContrato = computed(() => {
  if (!contrato.value) return [];
  return [
    { label: "Cliente", value: contrato.value.cliente?.nombre || "-", icon: "pi-user" },
    {
      label: "Vehiculo",
      value: `${nombreVehiculo(contrato.value.vehiculo)} - ${contrato.value.vehiculo?.placa || ""}`,
      icon: "pi-car",
    },
    { label: "Entrega", value: fmtFecha(contrato.value.fecha_hora_entrega), icon: "pi-sign-in" },
    {
      label: "Devolucion",
      value: fmtFecha(contrato.value.fecha_hora_devolucion),
      icon: "pi-sign-out",
    },
  ];
});

onMounted(async () => {
  try {
    contrato.value = await store.fetchContrato(route.params.id);
    nivelRecepcion.value = contrato.value.nivel_combustible_entrega || "1/2";
    cargos.value = cargosDesdeContrato(
      contrato.value.cargos_adicionales || contrato.value.cargosAdicionales,
    );
  } catch (e) {
    const msg =
      e.response?.status === 401
        ? "Tu sesion expiro. Vuelve a iniciar sesion."
        : e.response?.data?.message || store.error || "No se pudo cargar el contrato.";
    await Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: "#922b21" });
    router.push({ name: "contratos" });
  } finally {
    cargando.value = false;
  }
});

function cargosDesdeContrato(lista) {
  return (lista || [])
    .filter((c) => ["PENDIENTE", "APLICADO"].includes(c.estado_cargo))
    .map((c) => ({
      concepto: c.descripcion,
      monto: Number(c.monto),
      tipo_cargo: c.tipo_cargo || "OTRO",
    }));
}

function cargosValidos() {
  return cargos.value.filter((c) => c.concepto && Number(c.monto) > 0);
}

function fmtFecha(v) {
  return formatFechaHora12(v);
}

function fechaHoraActualApi() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function seleccionarCombustible(value) {
  if (NIVELES_COMBUSTIBLE.some((n) => n.value === value)) nivelRecepcion.value = value;
}

function combustibleCorto(nivel) {
  if (nivel.value === "VACIO") return "E";
  if (nivel.value === "LLENO") return "F";
  return nivel.label;
}

function agregarCargoCombustible() {
  cargos.value.push({ concepto: "Falta de gasolina", monto: 10, tipo_cargo: "COMBUSTIBLE" });
}

async function irACobrarSaldo() {
  cobrando.value = true;
  try {
    const nuevosCargos = cargosValidos();
    if (nuevosCargos.length) {
      await store.syncCargos(contrato.value.id, nuevosCargos);
      cargos.value = [];
    }
    router.push({ name: "pagos", query: { contrato_id: contrato.value.id, cobrar: "1" } });
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e.response?.data?.message || "No se pudieron registrar los cargos.",
      confirmButtonColor: "#922b21",
    });
  } finally {
    cobrando.value = false;
  }
}

async function cerrarRenta() {
  if (mensajeBloqueoCierre.value) {
    await Swal.fire({
      icon: "warning",
      title: "No se puede cerrar todavia",
      text: mensajeBloqueoCierre.value,
      confirmButtonColor: "#922b21",
    });
    return;
  }
  cerrando.value = true;
  try {
    const payload = {
      fecha_hora_recepcion: fechaHoraActualApi(),
      nivel_combustible_recepcion: nivelRecepcion.value,
      estado_vehiculo_recepcion: "RECIBIDO",
      observaciones: observacionesRecepcion.value || null,
      aplicar_cargo_retraso: Boolean(aplicarCargoRetraso.value),
    };
    if (aplicarCargoRetraso.value) {
      payload.monto_retraso = Number(montoRetraso.value);
    }
    await store.cerrarRenta(contrato.value.id, payload);
    await Swal.fire({
      icon: "success",
      title: "Renta cerrada",
      text: "Vehiculo liberado.",
      confirmButtonColor: "#922b21",
    });
    router.push({ name: "contratos" });
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e.response?.data?.message || store.error || "No se pudo cerrar la renta.",
      confirmButtonColor: "#922b21",
    });
  } finally {
    cerrando.value = false;
  }
}
</script>

<style scoped>
.cierre-root--light {
  min-height: 100vh;
  background: linear-gradient(160deg, #fafafa 0%, #f3f4f6 55%, #fef2f2 100%);
}
.cierre-root--dark {
  min-height: 100vh;
  background: linear-gradient(160deg, #030712 0%, #111827 60%, #1a0a08 100%);
}
.cierre-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem 0.75rem;
}
.cierre-back {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(146, 43, 33, 0.25);
  color: #922b21;
  background: rgba(146, 43, 33, 0.06);
  transition: background 0.15s;
}
.cierre-back:hover {
  background: rgba(146, 43, 33, 0.12);
}
.cierre-kicker {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #922b21;
}
.cierre-title {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.cierre-root--light .cierre-title {
  color: #111827;
}
.cierre-root--dark .cierre-title {
  color: #f9fafb;
}
.cierre-badge {
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(146, 43, 33, 0.1);
  color: #922b21;
  border: 1px solid rgba(146, 43, 33, 0.25);
}
.cierre-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 5rem;
  opacity: 0.5;
  font-size: 0.875rem;
}
.cierre-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
  align-items: start;
}
@media (min-width: 1024px) {
  .cierre-layout {
    grid-template-columns: 1fr 290px;
  }
}
.cierre-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}
.cierre-info-banner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  background: #fff;
  border: 1px solid rgba(146, 43, 33, 0.15);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(146, 43, 33, 0.06);
}
.cierre-root--dark .cierre-info-banner {
  background: #111827;
  border-color: rgba(146, 43, 33, 0.3);
}
@media (min-width: 640px) {
  .cierre-info-banner {
    grid-template-columns: repeat(4, 1fr);
  }
}
.cierre-info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}
.cierre-info-item i {
  color: #922b21;
  font-size: 0.9rem;
  margin-top: 0.15rem;
  flex-shrink: 0;
}
.cierre-info-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.5;
}
.cierre-info-value {
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.3;
  margin-top: 0.1rem;
}
.cierre-root--light .cierre-info-value {
  color: #1f2937;
}
.cierre-root--dark .cierre-info-value {
  color: #e5e7eb;
}
.cierre-card {
  background: #fff;
  border-radius: 1rem;
  border: 1px solid rgba(146, 43, 33, 0.12);
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(146, 43, 33, 0.05);
}
.cierre-root--dark .cierre-card {
  background: #111827;
  border-color: rgba(146, 43, 33, 0.25);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
.cierre-card-head {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1rem;
}
.cierre-card-head h2 {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex: 1;
  margin: 0;
}
.cierre-root--light .cierre-card-head h2 {
  color: #374151;
}
.cierre-root--dark .cierre-card-head h2 {
  color: #d1d5db;
}
.cierre-step {
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 999px;
  background: #922b21;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cierre-field {
  margin-bottom: 0.85rem;
}
.cierre-field:last-child {
  margin-bottom: 0;
}
.cierre-field label {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.55;
  margin-bottom: 0.35rem;
}
.cierre-readonly {
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px dashed rgba(146, 43, 33, 0.2);
  background: rgba(146, 43, 33, 0.03);
}
.cierre-root--dark .cierre-readonly {
  background: rgba(146, 43, 33, 0.08);
  color: #9ca3af;
}
.cierre-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  outline: none;
  border: 1.5px solid rgba(146, 43, 33, 0.2);
  background: #fff;
  color: inherit;
  transition: border-color 0.15s;
}
.cierre-input:focus {
  border-color: #922b21;
  box-shadow: 0 0 0 3px rgba(146, 43, 33, 0.1);
}
.cierre-root--dark .cierre-input {
  background: #1f2937;
  border-color: rgba(146, 43, 33, 0.35);
}
.cierre-input--sm {
  font-size: 0.8rem;
  padding: 0.55rem 0.75rem;
}
.cierre-input--amount {
  width: 6rem;
  flex-shrink: 0;
  text-align: right;
  font-weight: 700;
}
.cierre-input--type {
  width: 8.5rem;
  flex-shrink: 0;
}
.cierre-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 640px) {
  .cierre-grid-2 {
    grid-template-columns: 1fr 1fr;
  }
}
.cierre-fuel-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.cierre-fuel-col {
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid rgba(146, 43, 33, 0.12);
  border-radius: 0.9rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.75), rgba(248, 250, 252, 0.72));
}
.cierre-root--dark .cierre-fuel-col {
  border-color: rgba(146, 43, 33, 0.25);
  background: linear-gradient(180deg, rgba(31, 41, 55, 0.76), rgba(17, 24, 39, 0.74));
}
.cierre-fuel-tag {
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.55;
  display: block;
}
.cierre-fuel-val {
  display: block;
  font-size: 1.1rem;
  font-weight: 900;
  margin: 0.2rem 0 0.7rem;
}
.cierre-fuel-val--red {
  color: #922b21;
}
.cierre-fuel-val--gold {
  color: #d97706;
}
.cierre-fuel-meter {
  --fuel-fill: 50%;
  position: relative;
  height: 0.75rem;
  margin: 0.15rem 0.45rem 0.85rem;
  border-radius: 999px;
  background: #e5e7eb;
  box-shadow: inset 0 1px 4px rgba(15, 23, 42, 0.15);
}
.cierre-root--dark .cierre-fuel-meter {
  background: #374151;
}
.cierre-fuel-meter--readonly {
  margin-bottom: 0.1rem;
}
.cierre-fuel-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--fuel-fill);
  border-radius: inherit;
  background: linear-gradient(90deg, #dc2626 0%, #f97316 38%, #f59e0b 72%, #facc15 100%);
  box-shadow: 0 0 14px rgba(249, 115, 22, 0.3);
  transition: width 0.2s ease;
}
.cierre-fuel-point {
  position: absolute;
  top: 50%;
  width: 1.18rem;
  height: 1.18rem;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 2px solid #fff;
  background: #cbd5e1;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
  transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}
.cierre-fuel-point span {
  width: 0.34rem;
  height: 0.34rem;
  border-radius: inherit;
  background: #fff;
}
.cierre-fuel-point:hover,
.cierre-fuel-point--active {
  transform: translate(-50%, -50%) scale(1.13);
  background: #f59e0b;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.45);
}
.cierre-fuel-point--active {
  outline: 3px solid rgba(245, 158, 11, 0.16);
}
.cierre-fuel-labels {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.2rem;
}
.cierre-fuel-labels button {
  min-height: 1.65rem;
  border-radius: 999px;
  color: #64748b;
  background: rgba(148, 163, 184, 0.12);
  font-size: 0.68rem;
  font-weight: 900;
  transition: all 0.15s ease;
}
.cierre-fuel-labels button:hover,
.cierre-fuel-labels .cierre-fuel-label--active {
  color: #78350f;
  background: #fef3c7;
}
.cierre-root--dark .cierre-fuel-labels button {
  color: #cbd5e1;
  background: rgba(55, 65, 81, 0.8);
}
.cierre-root--dark .cierre-fuel-labels button:hover,
.cierre-root--dark .cierre-fuel-labels .cierre-fuel-label--active {
  color: #fef3c7;
  background: rgba(146, 64, 14, 0.72);
}
.cierre-alert {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
  padding: 0.65rem 0.85rem;
  border-radius: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  font-size: 0.75rem;
  font-weight: 600;
  color: #b45309;
}
.cierre-alert-btn {
  margin-left: auto;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: #922b21;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}
.cierre-alert-btn:hover {
  opacity: 0.85;
}
.cierre-status {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
}
.cierre-status i {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.cierre-status--warn i {
  color: #c0392b;
}
.cierre-status--ok i {
  color: #16a34a;
}
.cierre-status-title {
  font-size: 0.875rem;
  font-weight: 700;
}
.cierre-check {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.5rem;
  font-size: 0.76rem;
  font-weight: 700;
}
.cierre-helper {
  font-size: 0.76rem;
  opacity: 0.62;
  margin: -0.35rem 0 0.85rem;
  line-height: 1.45;
}
.cierre-add-btn {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  border: 1.5px solid #922b21;
  color: #922b21;
  background: rgba(146, 43, 33, 0.06);
  cursor: pointer;
  transition: background 0.15s;
}
.cierre-add-btn:hover {
  background: rgba(146, 43, 33, 0.12);
}
.cierre-empty-cargos {
  font-size: 0.8rem;
  opacity: 0.4;
  text-align: center;
  padding: 0.75rem 0;
}
.cierre-cargo-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
.cierre-remove-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid rgba(192, 57, 43, 0.3);
  color: #c0392b;
  background: rgba(192, 57, 43, 0.06);
  cursor: pointer;
  transition: background 0.15s;
}
.cierre-remove-btn:hover {
  background: rgba(192, 57, 43, 0.12);
}
.cierre-extras-total {
  text-align: right;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  opacity: 0.7;
}
.cierre-extras-total strong {
  color: #922b21;
  font-size: 1rem;
}
.cierre-ticket {
  background: #1a0a08;
  color: #fef2f2;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(146, 43, 33, 0.4);
}
@media (min-width: 1024px) {
  .cierre-ticket {
    position: sticky;
    top: 1rem;
  }
}
.cierre-ticket-perf {
  height: 8px;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 6px,
    #0d0504 6px,
    #0d0504 12px
  );
  opacity: 0.6;
}
.cierre-ticket-perf--flip {
  transform: rotate(180deg);
}
.cierre-ticket-head {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.25rem 1.25rem 1rem;
}
.cierre-ticket-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #922b21, #c0392b);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1rem;
}
.cierre-ticket-brand {
  font-size: 0.8rem;
  font-weight: 900;
}
.cierre-ticket-sub {
  font-size: 0.62rem;
  opacity: 0.5;
  margin-top: 0.1rem;
}
.cierre-ticket-line {
  height: 0;
  border-top: 2px dashed rgba(240, 165, 0, 0.3);
  margin: 0 1.25rem;
}
.cierre-ticket-rows {
  padding: 1rem 1.25rem;
}
.cierre-ticket-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  padding: 0.35rem 0;
  gap: 0.5rem;
}
.cierre-ticket-row span {
  opacity: 0.55;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.cierre-ticket-gold {
  color: #f0a500 !important;
}
.cierre-ticket-total {
  text-align: center;
  padding: 0 1.25rem 1rem;
  border-top: 1px solid rgba(240, 165, 0, 0.15);
  margin: 0 1.25rem;
  padding-top: 1rem;
}
.cierre-ticket-total span {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(240, 165, 0, 0.7);
  display: block;
}
.cierre-ticket-total p {
  font-size: 2rem;
  font-weight: 900;
  color: #f0a500;
  line-height: 1.1;
  margin-top: 0.15rem;
}
.cierre-ticket-note {
  margin: 0 1.25rem 1rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.65rem;
  background: rgba(240, 165, 0, 0.09);
  border: 1px solid rgba(240, 165, 0, 0.2);
  color: #fde68a;
  font-size: 0.72rem;
  line-height: 1.4;
}
.cierre-ticket-actions {
  padding: 0 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.cierre-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.15s;
  text-decoration: none;
}
.cierre-btn--outline {
  border: 1.5px solid rgba(240, 165, 0, 0.45);
  color: #f0a500;
  background: rgba(240, 165, 0, 0.08);
}
.cierre-btn--outline:hover:not(:disabled) {
  background: rgba(240, 165, 0, 0.16);
}
.cierre-btn--outline:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cierre-btn--primary {
  border: none;
  color: #fff;
  background: linear-gradient(135deg, #922b21, #c0392b);
  box-shadow: 0 4px 14px rgba(146, 43, 33, 0.4);
}
.cierre-btn--primary:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}
.cierre-btn--primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}
@media (max-width: 640px) {
  .cierre-cargo-row {
    flex-wrap: wrap;
  }
  .cierre-input--type,
  .cierre-input--amount {
    width: 100%;
  }
}
</style>
