import api from '@/services/api'

/**
 * Descarga un PDF autenticado desde la API y lo abre en una nueva pestaña.
 */
export async function abrirPdf(url, params = {}) {
  const res = await api.get(url, {
    params,
    responseType: 'blob',
    headers: { Accept: 'application/pdf' },
  })

  await validarRespuestaPdf(res)

  const blob = new Blob([res.data], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)
  const ventana = window.open(blobUrl, '_blank')

  if (!ventana) {
    descargarBlob(blob, extraerNombre(res) || 'documento.pdf')
    URL.revokeObjectURL(blobUrl)
    return null
  }

  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
  return blobUrl
}

/**
 * Obtiene un PDF como blob URL (útil para iframes en modales).
 */
export async function obtenerPdfBlobUrl(url, params = {}) {
  const res = await api.get(url, {
    params,
    responseType: 'blob',
    headers: { Accept: 'application/pdf' },
  })

  await validarRespuestaPdf(res)

  const blob = new Blob([res.data], { type: 'application/pdf' })
  return {
    blobUrl: URL.createObjectURL(blob),
    filename: extraerNombre(res) || 'documento.pdf',
    blob,
  }
}

export function revocarPdfBlobUrl(blobUrl) {
  if (blobUrl) URL.revokeObjectURL(blobUrl)
}

export function descargarBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function extraerNombre(response) {
  const disposition = response.headers['content-disposition'] || ''
  const match = disposition.match(/filename[^;=\n]*=(['"]?)([^'"\n]*)\1/)
  return match?.[2] ? decodeURIComponent(match[2]) : null
}

async function validarRespuestaPdf(response) {
  const type = response.data?.type || response.headers['content-type'] || ''
  if (!type.includes('application/json')) return

  const text = await response.data.text()
  let message = 'Error al generar el PDF.'
  try {
    const json = JSON.parse(text)
    message = json.message || message
  } catch {
    /* usar mensaje por defecto */
  }
  const err = new Error(message)
  err.response = { data: { message } }
  throw err
}
