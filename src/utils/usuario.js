const colores = ['#c0392b', '#f0a500', '#2563eb', '#16a34a', '#7c3aed', '#0891b2']

export function esAdministrador(usuario) {
  return usuario?.roles?.[0]?.name === 'ADMINISTRADOR'
}

export function avatarColor(nombre) {
  let h = 0
  for (let i = 0; i < nombre.length; i++) h = nombre.charCodeAt(i) + ((h << 5) - h)
  return colores[Math.abs(h) % colores.length]
}

export function initials(nombre) {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function rolStyle(rol) {
  const map = {
    'Administrador': 'background:#fef2f2; color:#c0392b;',
    'Empleado':      'background:#dbeafe; color:#1e40af;',
    'Contador':      'background:#f3e8ff; color:#7c3aed;',
  }
  return map[rol] || 'background:#f3f4f6; color:#4b5563;'
}

export function rolIcon(rol) {
  const map = {
    'Administrador': 'pi-shield',
    'Empleado':      'pi-user',
    'Contador':      'pi-calculator',
  }
  return map[rol] || 'pi-user'
}
