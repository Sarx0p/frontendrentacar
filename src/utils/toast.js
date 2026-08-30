import Swal from 'sweetalert2'

const DEFAULT_TIMER = 2500

export function showToast({
  icon = 'success',
  title,
  text,
  timer = DEFAULT_TIMER,
} = {}) {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    text,
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
  })
}

export function toastSuccess(title, text) {
  return showToast({ icon: 'success', title, text })
}

export function toastWarning(title, text) {
  return showToast({ icon: 'warning', title, text, timer: 3200 })
}

export function toastError(title, text) {
  return showToast({ icon: 'error', title, text, timer: 3500 })
}
