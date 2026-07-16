<template>
  <Teleport to="body">
    <Transition name="pay-slide">
      <div v-if="visible" class="pay-overlay" @click.self="$emit('cerrar')">
        <div class="pay-modal" :class="isDark ? 'pay-modal--dark' : ''" @click.stop>

          <!-- Cabecera tipo recibo -->
          <div class="pay-receipt-top">
            <button type="button" class="pay-close" @click="$emit('cerrar')">
              <i class="pi pi-times"></i>
            </button>
            <p class="pay-receipt-brand">RentaCar · Cobro</p>
            <p class="pay-receipt-contract">{{ contrato?.numero_contrato }}</p>
            <p class="pay-receipt-client">{{ contrato?.reserva?.cliente?.nombre }}</p>
          </div>

          <!-- Desglose renta + extras -->
          <div v-if="montoExtras > 0" class="pay-breakdown">
            <div class="pay-breakdown-row">
              <span>Renta contrato</span>
              <strong>${{ formatPrecio(rentaBase) }}</strong>
            </div>
            <div class="pay-breakdown-row pay-breakdown-row--extras">
              <span>Cargos extras</span>
              <strong>+${{ formatPrecio(montoExtras) }}</strong>
            </div>
            <ul v-if="cargosLista.length" class="pay-cargos-list">
              <li v-for="(cargo, i) in cargosLista" :key="i">
                {{ cargo.descripcion }} · ${{ formatPrecio(cargo.monto) }}
              </li>
            </ul>
          </div>

          <!-- Anillo de progreso + saldo -->
          <div class="pay-hero">
            <div class="pay-ring-wrap">
              <svg class="pay-ring" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(146,43,33,0.15)" stroke-width="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke="#922b21" stroke-width="8" stroke-linecap="round"
                  :stroke-dasharray="`${pctPagado * 3.27} 327`"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div class="pay-ring-center">
                <span class="pay-ring-pct">{{ Math.round(pctPagado) }}%</span>
                <span class="pay-ring-lbl">pagado</span>
              </div>
            </div>
            <div class="pay-saldo-block">
              <p class="pay-saldo-label">Saldo pendiente</p>
              <p class="pay-saldo-amount">${{ formatPrecio(saldo) }}</p>
              <div class="pay-saldo-meta">
                <span>Total ${{ formatPrecio(total) }}</span>
                <span v-if="montoExtras > 0" class="pay-saldo-dot">·</span>
                <span v-if="montoExtras > 0">Extras ${{ formatPrecio(montoExtras) }}</span>
                <span class="pay-saldo-dot">·</span>
                <span>Pagado ${{ formatPrecio(pagado) }}</span>
              </div>
              <span class="pay-estado-badge" :style="estadoPagoStyle(estadoPago)">{{ labelEstadoPago(estadoPago) }}</span>
            </div>
          </div>

          <form class="pay-form" @submit.prevent="guardar">
            <!-- Monto grande -->
            <div class="pay-amount-box">
              <label class="pay-amount-label">Monto a registrar</label>
              <div class="pay-amount-input-wrap">
                <span class="pay-amount-symbol">$</span>
                <input
                  v-model.number="monto"
                  type="number"
                  min="0.01"
                  :max="saldo"
                  step="0.01"
                  class="pay-amount-input"
                  :disabled="saldo <= 0"
                />
              </div>
              <button v-if="saldo > 0" type="button" class="pay-amount-full" @click="monto = saldo">
                Pagar saldo completo
              </button>
            </div>

            <!-- Método -->
            <div class="pay-methods">
              <button
                v-for="m in metodos"
                :key="m.value"
                type="button"
                class="pay-method"
                :class="{ 'pay-method--active': metodo === m.value }"
                @click="metodo = m.value"
              >
                <i :class="['pi', m.icon]"></i>
                <span>{{ m.label }}</span>
              </button>
            </div>

            <button
              type="submit"
              class="pay-submit"
              :disabled="guardando || saldo <= 0 || !monto || monto <= 0"
            >
              <i :class="guardando ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"></i>
              {{ guardando ? 'Procesando...' : `Confirmar pago de $${formatPrecio(monto)}` }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'
import { formatPrecio, labelEstadoPago, montoExtrasContrato, montoPagadoContrato, totalFinalContrato, saldoPendienteContrato } from '@/utils/contratoFormatters'

const props = defineProps({
  visible:   { type: Boolean, default: false },
  contrato:  { type: Object, default: null },
  guardando: { type: Boolean, default: false },
})

const emit = defineEmits(['cerrar', 'guardar'])

const { isDark } = useAppTheme()
const monto = ref(0)
const metodo = ref('EFECTIVO')

const metodos = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: 'pi-wallet' },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: 'pi-building' },
]

const rentaBase = computed(() => Number(props.contrato?.monto_total_renta || 0))
const montoExtras = computed(() => montoExtrasContrato(props.contrato))
const cargosLista = computed(() => {
  const cargos = props.contrato?.cargos_adicionales || props.contrato?.cargosAdicionales || []
  return cargos.filter((c) => ['PENDIENTE', 'APLICADO'].includes(c.estado_cargo))
})
const total = computed(() => totalFinalContrato(props.contrato))
const pagado = computed(() => montoPagadoContrato(props.contrato))
const saldo = computed(() => saldoPendienteContrato(props.contrato))
const pctPagado = computed(() => total.value > 0 ? (pagado.value / total.value) * 100 : 0)
const estadoPago = computed(() => props.contrato?.estado_pago || 'PENDIENTE')

watch(() => props.visible, (v) => {
  if (v) { monto.value = saldo.value; metodo.value = 'EFECTIVO' }
})
watch(saldo, (s) => { if (props.visible) monto.value = s })

function estadoPagoStyle(estado) {
  const m = { PENDIENTE: 'background:#fee2e2;color:#991b1b;', PARCIAL: 'background:#fef3c7;color:#92400e;', PAGADO: 'background:#dcfce7;color:#166534;' }
  return m[estado] || 'background:#f3f4f6;color:#6b7280;'
}

function guardar() {
  emit('guardar', { monto: monto.value, metodo_pago: metodo.value })
}
</script>

<style scoped>
.pay-overlay {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: flex-end; justify-content: center;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
  padding: 0;
}
@media (min-width: 640px) {
  .pay-overlay { padding: 1rem; align-items: center; }
}

.pay-modal {
  width: 100%; max-width: 420px;
  background: #fff; border-radius: 1.25rem 1.25rem 0 0;
  overflow: hidden; box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
}
@media (min-width: 640px) { .pay-modal { border-radius: 1.25rem; box-shadow: 0 24px 60px rgba(0,0,0,0.25); } }
.pay-modal--dark { background: #111827; color: #f3f4f6; }

.pay-receipt-top {
  background: linear-gradient(160deg, #922b21 0%, #6b2118 100%);
  color: #fff; padding: 1.25rem 1.5rem 1.5rem;
  position: relative; text-align: center;
}
.pay-close {
  position: absolute; top: 1rem; right: 1rem;
  width: 2rem; height: 2rem; border-radius: 999px;
  background: rgba(255,255,255,0.15); color: #fff;
  display: flex; align-items: center; justify-content: center;
  border: none; transition: background 0.15s;
}
.pay-close:hover { background: rgba(255,255,255,0.25); }
.pay-receipt-brand { font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.7; }
.pay-receipt-contract { font-family: ui-monospace, monospace; font-size: 1.1rem; font-weight: 900; margin-top: 0.25rem; }
.pay-receipt-client { font-size: 0.8rem; opacity: 0.75; margin-top: 0.15rem; }

.pay-breakdown {
  padding: 0.85rem 1.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}
.pay-modal--dark .pay-breakdown { border-color: #1f2937; }
.pay-breakdown-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.75rem; padding: 0.2rem 0;
}
.pay-breakdown-row span { opacity: 0.55; text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.62rem; font-weight: 700; }
.pay-breakdown-row--extras strong { color: #d97706; }
.pay-cargos-list {
  margin: 0.35rem 0 0.75rem; padding: 0.55rem 0.75rem; list-style: none;
  border-radius: 0.65rem; background: rgba(146,43,33,0.05);
  font-size: 0.68rem; opacity: 0.75;
}
.pay-modal--dark .pay-cargos-list { background: rgba(146,43,33,0.12); }
.pay-cargos-list li + li { margin-top: 0.2rem; }

.pay-hero {
  display: flex; align-items: center; gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}
.pay-modal--dark .pay-hero { border-color: #1f2937; }

.pay-ring-wrap { position: relative; width: 90px; height: 90px; flex-shrink: 0; }
.pay-ring { width: 100%; height: 100%; }
.pay-ring-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.pay-ring-pct { font-size: 1.1rem; font-weight: 900; color: #922b21; line-height: 1; }
.pay-ring-lbl { font-size: 0.55rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.5; }

.pay-saldo-block { flex: 1; min-width: 0; }
.pay-saldo-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.5; }
.pay-saldo-amount { font-size: 1.75rem; font-weight: 900; color: #922b21; letter-spacing: -0.02em; line-height: 1.1; }
.pay-saldo-meta { font-size: 0.7rem; opacity: 0.55; margin-top: 0.2rem; display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center; }
.pay-saldo-dot { opacity: 0.4; }
.pay-estado-badge { display: inline-block; margin-top: 0.4rem; font-size: 0.62rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 999px; }

.pay-form { padding: 1.25rem 1.5rem 1.5rem; }

.pay-amount-box { margin-bottom: 1.25rem; }
.pay-amount-label { display: block; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.5; margin-bottom: 0.5rem; }
.pay-amount-input-wrap {
  display: flex; align-items: center;
  border: 2px solid #922b21; border-radius: 1rem;
  background: rgba(146,43,33,0.04); overflow: hidden;
}
.pay-modal--dark .pay-amount-input-wrap { background: rgba(146,43,33,0.12); }
.pay-amount-symbol { padding: 0 0 0 1rem; font-size: 1.5rem; font-weight: 900; color: #922b21; }
.pay-amount-input {
  flex: 1; border: none; background: transparent; outline: none;
  font-size: 2rem; font-weight: 900; color: inherit;
  padding: 0.75rem 1rem 0.75rem 0.25rem; width: 100%;
  -moz-appearance: textfield;
}
.pay-amount-input::-webkit-outer-spin-button,
.pay-amount-input::-webkit-inner-spin-button { -webkit-appearance: none; }
.pay-amount-full {
  margin-top: 0.5rem; font-size: 0.72rem; font-weight: 700;
  color: #922b21; background: none; border: none; cursor: pointer;
  text-decoration: underline; opacity: 0.8;
}
.pay-amount-full:hover { opacity: 1; }

.pay-methods { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 1.25rem; }
.pay-method {
  display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
  padding: 0.85rem 0.5rem; border-radius: 0.875rem;
  border: 2px solid #e5e7eb; background: #fafafa;
  font-size: 0.75rem; font-weight: 700; color: #6b7280;
  transition: all 0.15s;
}
.pay-modal--dark .pay-method { border-color: #374151; background: #1f2937; color: #9ca3af; }
.pay-method i { font-size: 1.25rem; }
.pay-method--active {
  border-color: #922b21 !important; background: rgba(146,43,33,0.06) !important;
  color: #922b21 !important;
}

.pay-submit {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 1rem; border-radius: 0.875rem; border: none;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff; font-size: 0.9rem; font-weight: 800;
  box-shadow: 0 4px 16px rgba(22,163,74,0.35);
  transition: all 0.15s;
}
.pay-submit:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
.pay-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

.pay-slide-enter-active, .pay-slide-leave-active { transition: all 0.3s ease; }
.pay-slide-enter-from, .pay-slide-leave-to { opacity: 0; }
.pay-slide-enter-from .pay-modal, .pay-slide-leave-to .pay-modal { transform: translateY(100%); }
@media (min-width: 640px) {
  .pay-slide-enter-from .pay-modal, .pay-slide-leave-to .pay-modal { transform: translateY(20px) scale(0.97); }
}
</style>
