import { formatFecha, fechaSoloISO } from '@/utils/reservaFormatters'

export function labelTipoHistorial(tipo) {
  const map = {
    DANIO: 'Daño',
    ACCIDENTE: 'Accidente',
    'FALLA MECANICA': 'Falla mecánica',
    OTRO: 'Otro',
  }
  return map[tipo] || tipo || '—'
}

export function labelEstadoHistorial(estado) {
  const map = {
    REPORTADA: 'Reportada',
    'EN REVISION': 'En revisión',
    RESUELTA: 'Resuelta',
    ANULADA: 'Anulada',
  }
  return map[estado] || estado || '—'
}

export function estadoHistorialStyle(estado, isDark = false) {
  const light = {
    REPORTADA:      'background:#fef3c7;color:#92400e;',
    'EN REVISION':  'background:#dbeafe;color:#1d4ed8;',
    RESUELTA:       'background:#dcfce7;color:#166534;',
    ANULADA:        'background:#f3f4f6;color:#6b7280;',
  }
  const dark = {
    REPORTADA:      'background:rgba(234,179,8,0.15);color:#fbbf24;border:1px solid rgba(234,179,8,0.3);',
    'EN REVISION':  'background:rgba(29,78,216,0.2);color:#93c5fd;border:1px solid rgba(59,130,246,0.3);',
    RESUELTA:       'background:rgba(22,101,52,0.25);color:#86efac;border:1px solid rgba(34,197,94,0.3);',
    ANULADA:        'background:rgba(55,65,81,0.5);color:#9ca3af;border:1px solid #374151;',
  }
  const styles = isDark ? dark : light
  return styles[estado] || (isDark ? 'background:#374151;color:#d1d5db;' : 'background:#f3f4f6;color:#4b5563;')
}

export function labelResponsableIncidencia(tipo) {
  const map = {
    CLIENTE: 'Cliente',
    NEGOCIO: 'Negocio',
    TERCERO: 'Tercero',
    'NO DETERMINADO': 'No determinado',
  }
  return map[tipo] || tipo || '—'
}

export function nombreVehiculoHistorial(vehiculo) {
  if (!vehiculo) return '—'
  const marca = vehiculo.modelo?.marca?.nombre
  const modelo = vehiculo.modelo?.nombre
  const nombre = [marca, modelo].filter(Boolean).join(' ')
  return nombre ? `${nombre} (${vehiculo.placa})` : vehiculo.placa || '—'
}

export function nombreUsuarioHistorial(user) {
  if (!user) return '—'
  return [user.nombre, user.apellido].filter(Boolean).join(' ') || '—'
}

export function formatMoneyHistorial(val) {
  return '$' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatFechaSoloHistorial(fecha) {
  return formatFecha(fecha)
}

export function formatFechaHoraHistorial(fecha) {
  if (!fecha) return '—'
  const iso = fechaSoloISO(fecha)
  const tieneHora = String(fecha).includes('T') && !String(fecha).endsWith('T00:00:00.000000Z') && !String(fecha).match(/T00:00:00/)
  if (iso && !tieneHora) {
    return formatFecha(fecha)
  }
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function labelEstadoReserva(estado) {
  const map = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    CANCELADA: 'Cancelada',
  }
  return map[estado] || estado || '—'
}

export function labelTipoReserva(tipo) {
  const map = {
    INMEDIATA: 'Renta directa',
    ANTISIPADA: 'Reserva anticipada',
  }
  return map[tipo] || tipo || '—'
}

export function labelEstadoContrato(estado) {
  const map = {
    PENDIENTE: 'Pendiente',
    ACTIVO: 'Activo',
    VENCIDO: 'Vencido',
    FINALIZADO: 'Finalizado',
    ANULADO: 'Anulado',
  }
  return map[estado] || estado || '—'
}

export function estadoReservaStyle(estado, isDark = false) {
  const light = {
    PENDIENTE:  'background:#fef3c7;color:#92400e;',
    CONFIRMADA: 'background:#dcfce7;color:#166534;',
    CANCELADA:  'background:#fee2e2;color:#991b1b;',
  }
  const dark = {
    PENDIENTE:  'background:rgba(234,179,8,0.15);color:#fbbf24;border:1px solid rgba(234,179,8,0.3);',
    CONFIRMADA: 'background:rgba(22,101,52,0.25);color:#86efac;border:1px solid rgba(34,197,94,0.3);',
    CANCELADA:  'background:rgba(127,29,29,0.35);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);',
  }
  const styles = isDark ? dark : light
  return styles[estado] || (isDark ? 'background:#374151;color:#d1d5db;' : 'background:#f3f4f6;color:#4b5563;')
}

export function estadoContratoStyle(estado, isDark = false) {
  const light = {
    PENDIENTE:  'background:#fef3c7;color:#92400e;',
    ACTIVO:     'background:#dcfce7;color:#166534;',
    VENCIDO:    'background:#ffedd5;color:#c2410c;',
    FINALIZADO: 'background:#dbeafe;color:#1d4ed8;',
    ANULADO:    'background:#fee2e2;color:#991b1b;',
  }
  const dark = {
    PENDIENTE:  'background:rgba(234,179,8,0.15);color:#fbbf24;border:1px solid rgba(234,179,8,0.3);',
    ACTIVO:     'background:rgba(22,101,52,0.25);color:#86efac;border:1px solid rgba(34,197,94,0.3);',
    VENCIDO:    'background:rgba(194,65,12,0.2);color:#fdba74;border:1px solid rgba(249,115,22,0.3);',
    FINALIZADO: 'background:rgba(29,78,216,0.2);color:#93c5fd;border:1px solid rgba(59,130,246,0.3);',
    ANULADO:    'background:rgba(127,29,29,0.35);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);',
  }
  const styles = isDark ? dark : light
  return styles[estado] || (isDark ? 'background:#374151;color:#d1d5db;' : 'background:#f3f4f6;color:#4b5563;')
}

export function labelMetodoPago(metodo) {
  const map = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    DEPOSITO: 'Depósito',
  }
  return map[metodo] || metodo || '—'
}

export function labelEstadoTransaccion(estado) {
  const map = {
    PENDIENTE: 'Pendiente',
    CONFIRMADO: 'Confirmado',
    FALLIDO: 'Fallido',
    ANULADO: 'Anulado',
  }
  return map[estado] || estado || '—'
}

export function estadoTransaccionStyle(estado, isDark = false) {
  const light = {
    PENDIENTE:  'background:#fef3c7;color:#92400e;',
    CONFIRMADO: 'background:#dcfce7;color:#166534;',
    FALLIDO:    'background:#fee2e2;color:#991b1b;',
    ANULADO:    'background:#f3f4f6;color:#6b7280;',
  }
  const dark = {
    PENDIENTE:  'background:rgba(234,179,8,0.15);color:#fbbf24;border:1px solid rgba(234,179,8,0.3);',
    CONFIRMADO: 'background:rgba(22,101,52,0.25);color:#86efac;border:1px solid rgba(34,197,94,0.3);',
    FALLIDO:    'background:rgba(127,29,29,0.35);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);',
    ANULADO:    'background:rgba(55,65,81,0.5);color:#9ca3af;border:1px solid #374151;',
  }
  const styles = isDark ? dark : light
  return styles[estado] || (isDark ? 'background:#374151;color:#d1d5db;' : 'background:#f3f4f6;color:#4b5563;')
}

export function labelTipoCargo(tipo) {
  const map = {
    COMBUSTIBLE: 'Combustible',
    RETRASO: 'Retraso',
    'DIA EXTRA': 'Día extra',
    DANIO: 'Daño',
    OTRO: 'Otro',
  }
  return map[tipo] || tipo || '—'
}

export function labelEstadoCargo(estado) {
  const map = {
    PENDIENTE: 'Pendiente',
    APLICADO: 'Aplicado',
    ANULADO: 'Anulado',
  }
  return map[estado] || estado || '—'
}

export function estadoCargoStyle(estado, isDark = false) {
  const light = {
    PENDIENTE: 'background:#fef3c7;color:#92400e;',
    APLICADO:  'background:#dcfce7;color:#166534;',
    ANULADO:   'background:#f3f4f6;color:#6b7280;',
  }
  const dark = {
    PENDIENTE: 'background:rgba(234,179,8,0.15);color:#fbbf24;border:1px solid rgba(234,179,8,0.3);',
    APLICADO:  'background:rgba(22,101,52,0.25);color:#86efac;border:1px solid rgba(34,197,94,0.3);',
    ANULADO:   'background:rgba(55,65,81,0.5);color:#9ca3af;border:1px solid #374151;',
  }
  const styles = isDark ? dark : light
  return styles[estado] || (isDark ? 'background:#374151;color:#d1d5db;' : 'background:#f3f4f6;color:#4b5563;')
}
