import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { THEME_STORAGE_KEY, applyDarkClass, getInitialDark } from '@/theme'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(getInitialDark())

  watch(
    isDark,
    (v) => {
      applyDarkClass(v)
      localStorage.setItem(THEME_STORAGE_KEY, v ? 'true' : 'false')
    },
    { immediate: true },
  )

  function setDark(value) {
    const on =
      value === true ||
      value === 1 ||
      value === '1' ||
      value === 'true'
    isDark.value = on
  }

  return { isDark, setDark }
})
