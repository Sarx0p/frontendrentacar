export function formatMoney(val) {
  return '$' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatFechaReporte(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha.includes('T') ? fecha : fecha + 'T00:00:00')
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatFechaCorta(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha.includes('T') ? fecha : fecha + 'T00:00:00')
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short' })
}

export function estadoClaseReporte(estado, isDark = false) {
  if (isDark) {
    const clases = {
      Activa:     'bg-green-950/50 text-green-400',
      Vencida:    'bg-orange-950/50 text-orange-400',
      Finalizada: 'bg-blue-950/50 text-blue-400',
      Pendiente:  'bg-yellow-950/50 text-yellow-400',
      Cancelada:  'bg-red-950/50 text-red-400',
    }
    return clases[estado] ?? 'bg-gray-800 text-gray-400'
  }
  const clases = {
    Activa:     'bg-green-100 text-green-700',
    Vencida:    'bg-orange-100 text-orange-700',
    Finalizada: 'bg-blue-100 text-blue-700',
    Pendiente:  'bg-yellow-100 text-yellow-700',
    Cancelada:  'bg-red-100 text-red-600',
  }
  return clases[estado] ?? 'bg-gray-100 text-gray-600'
}
