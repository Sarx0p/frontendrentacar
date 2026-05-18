import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'

export function useAppTheme() {
  return storeToRefs(useThemeStore())
}
