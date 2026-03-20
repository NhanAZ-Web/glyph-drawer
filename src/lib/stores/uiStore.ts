import { writable } from 'svelte/store'

export type Theme = 'light' | 'dark'
const THEME_KEY = 'glyph-drawer-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = window.localStorage.getItem(THEME_KEY) as Theme | null
  if (saved === 'light' || saved === 'dark') return saved
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

const store = writable<Theme>(getInitialTheme())
store.subscribe((theme) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_KEY, theme)
  }
  applyTheme(theme)
})

function toggle() {
  store.update((theme) => (theme === 'light' ? 'dark' : 'light'))
}

export const themeStore = {
  subscribe: store.subscribe,
  toggle,
  set: store.set,
}
