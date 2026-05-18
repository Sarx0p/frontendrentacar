export const THEME_STORAGE_KEY = 'rentacar-dark-mode'

export function getInitialDark() {
  return localStorage.getItem(THEME_STORAGE_KEY) === 'true'
}

// `data-theme` en `#app` activa las variantes `dark:` (tailwind.config.js).
export function applyDarkClass(isDark) {
  const mode = isDark ? 'dark' : 'light'
  const html = document.documentElement
  html.setAttribute('data-theme', mode)
  html.classList.toggle('dark', isDark)
  const app = document.getElementById('app')
  if (app) app.setAttribute('data-theme', mode)
}
