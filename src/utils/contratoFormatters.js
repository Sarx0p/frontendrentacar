export const HORAS_PERMITIDAS = ['06:00', '06:30', '07:00', '18:00', '18:30', '19:00']

export const NIVELES_COMBUSTIBLE = [
  { value: 'VACIO', label: 'Vacío', pct: 0 },
  { value: '1/4', label: '1/4', pct: 25 },
  { value: '1/2', label: '1/2', pct: 50 },
  { value: '3/4', label: '3/4', pct: 75 },
  { value: 'LLENO', label: 'Lleno', pct: 100 },
]

export function formatPrecio(n) {
  return Number(n || 0).toLocaleString('es-SV', { minimumFractionDigits: 2 })
}

export function nombreVehiculo(v) {
  if (!v) return '—'
  const marca = v.modelo?.marca?.nombre
  const modelo = v.modelo?.nombre
  return [marca, modelo].filter(Boolean).join(' ') || v.placa
}

export function calcularDias(fechaEntrega, fechaDevolucion) {
  if (!fechaEntrega || !fechaDevolucion) return 0
  const d1 = new Date(fechaEntrega.slice(0, 10) + 'T00:00:00')
  const d2 = new Date(fechaDevolucion.slice(0, 10) + 'T00:00:00')
  return Math.max(1, Math.round((d2 - d1) / 86400000) + 1)
}

export function labelEstadoContrato(e) {
  const m = { PENDIENTE: 'Pendiente', ACTIVO: 'Activo', VENCIDO: 'Vencido', FINALIZADO: 'Finalizado', ANULADO: 'Anulado' }
  return m[e] || e
}

export function labelEstadoPago(e) {
  const m = { PENDIENTE: 'Pendiente', PARCIAL: 'Pago parcial', PAGADO: 'Pagado' }
  return m[e] || e
}

export function badgeEstadoPago(estado, isDark = false) {
  if (isDark) {
    const m = {
      PENDIENTE: 'bg-red-950/60 text-red-300 border-red-900/60',
      PARCIAL: 'bg-amber-950/60 text-amber-300 border-amber-900/60',
      PAGADO: 'bg-green-950/60 text-green-300 border-green-900/60',
    }
    return m[estado] || 'bg-gray-800 text-gray-400 border-gray-700'
  }
  const m = {
    PENDIENTE: 'bg-red-50 text-red-800 border-red-200',
    PARCIAL: 'bg-amber-50 text-amber-800 border-amber-200',
    PAGADO: 'bg-green-50 text-green-800 border-green-200',
  }
  return m[estado] || 'bg-gray-100 text-gray-600 border-gray-200'
}

export function badgeEstadoContrato(estado, isDark = false) {
  if (isDark) {
    const m = {
      PENDIENTE: 'bg-gray-800 text-gray-300 border-gray-700',
      ACTIVO: 'bg-red-950/60 text-red-300 border-red-900/60',
      VENCIDO: 'bg-amber-950/60 text-amber-300 border-amber-900/60',
      FINALIZADO: 'bg-green-950/60 text-green-300 border-green-900/60',
      ANULADO: 'bg-gray-800 text-gray-500 border-gray-700',
    }
    return m[estado] || 'bg-gray-800 text-gray-400 border-gray-700'
  }
  const m = {
    PENDIENTE: 'bg-gray-100 text-gray-700 border-gray-200',
    ACTIVO: 'bg-red-50 text-red-800 border-red-200',
    VENCIDO: 'bg-amber-50 text-amber-800 border-amber-200',
    FINALIZADO: 'bg-green-50 text-green-800 border-green-200',
    ANULADO: 'bg-gray-100 text-gray-500 border-gray-200',
  }
  return m[estado] || 'bg-gray-100 text-gray-600 border-gray-200'
}

export function metodoPagoIcon(metodo) {
  const m = { EFECTIVO: 'pi-wallet', TRANSFERENCIA: 'pi-building', TARJETA: 'pi-credit-card' }
  return m[metodo] || 'pi-dollar'
}

export function documentosVigentes(cliente) {
  if (!cliente) return { ok: false, duiVencido: false, licenciaVencida: true }
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const licencia = cliente.vencimiento_licencia ? new Date(cliente.vencimiento_licencia + 'T00:00:00') : null
  const licenciaVencida = !licencia || licencia < hoy
  return { ok: !licenciaVencida, duiVencido: false, licenciaVencida }
}

export function nivelCombustiblePct(valor) {
  return NIVELES_COMBUSTIBLE.find((n) => n.value === valor)?.pct ?? 0
}

const ESTADOS_CARGO_COBRABLE = ['PENDIENTE', 'APLICADO']

export function montoExtrasContrato(contrato) {
  if (!contrato) return 0
  if (contrato.monto_extras != null) return Number(contrato.monto_extras)
  const cargos = contrato.cargos_adicionales || contrato.cargosAdicionales || []
  return cargos
    .filter((c) => ESTADOS_CARGO_COBRABLE.includes(c.estado_cargo))
    .reduce((s, c) => s + Number(c.monto || 0), 0)
}

export function montoPagadoContrato(contrato) {
  if (!contrato) return 0
  if (contrato.monto_pagado != null) return Number(contrato.monto_pagado)
  const pagos = contrato.pagos || []
  return pagos
    .filter((p) => p.estado_transaccion === 'CONFIRMADO')
    .reduce((s, p) => s + Number(p.monto || 0), 0)
}

export function totalFinalContrato(contrato) {
  if (!contrato) return 0
  if (contrato.total_final != null) return Number(contrato.total_final)
  return Number(contrato.monto_total_renta || 0) + montoExtrasContrato(contrato)
}

export function saldoPendienteContrato(contrato) {
  if (!contrato) return 0
  if (contrato.saldo_pendiente != null) return Number(contrato.saldo_pendiente)
  return Math.max(0, totalFinalContrato(contrato) - montoPagadoContrato(contrato))
}
