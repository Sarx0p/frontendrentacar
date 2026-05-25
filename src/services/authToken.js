export function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

export function getActiveStorage() {
  if (localStorage.getItem('token')) return localStorage
  if (sessionStorage.getItem('token')) return sessionStorage
  return null
}

export function saveToken(token, user = null) {
  const storage = getActiveStorage() || localStorage
  storage.setItem('token', token)
  if (user !== null) {
    storage.setItem('user', JSON.stringify(user))
  }
}

export function saveSession(token, user, remember = false) {
  clearSession()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem('token', token)
  storage.setItem('user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
}
