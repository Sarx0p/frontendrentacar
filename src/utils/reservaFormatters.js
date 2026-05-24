export function initials(nombre) {
  if (!nombre) return '?'
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
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
