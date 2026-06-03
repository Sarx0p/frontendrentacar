/** Fecha local YYYY-MM-DD (evita desfase por UTC en toISOString). */
export function fechaHoyLocal() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function sumarDiasISO(iso, dias) {
  const [y, m, day] = iso.split('-').map(Number)
  const d = new Date(y, m - 1, day + dias)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function initials(nombre) {
  if (!nombre) return '?'
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

/** Extrae YYYY-MM-DD sin desfase por zona horaria (API Laravel suele enviar ...T00:00:00.000000Z). */
export function fechaSoloISO(fecha) {
  if (!fecha) return ''
  const match = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : ''
}

export function formatFecha(fecha) {
  const iso = fechaSoloISO(fecha)
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Días de renta inclusivos entre dos fechas calendario (YYYY-MM-DD). */
export function diasEntreFechasISO(inicio, fin) {
  const a = fechaSoloISO(inicio)
  const b = fechaSoloISO(fin)
  if (!a || !b) return 0
  const [y1, m1, d1] = a.split('-').map(Number)
  const [y2, m2, d2] = b.split('-').map(Number)
  const t1 = new Date(y1, m1 - 1, d1).getTime()
  const t2 = new Date(y2, m2 - 1, d2).getTime()
  return Math.max(1, Math.round((t2 - t1) / 86400000) + 1)
}

export function nombreVehiculo(v) {
  if (!v) return '—'
  const marca = v.modelo?.marca?.nombre
  const modelo = v.modelo?.nombre
  return [marca, modelo].filter(Boolean).join(' ') || v.placa
}

export function formatPrecio(n) {
  return Number(n).toLocaleString('es-SV', { minimumFractionDigits: 2 })
}
