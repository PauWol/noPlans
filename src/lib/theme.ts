export type Theme = 'light' | 'dark' | 'system'

export function applyTheme(theme: Theme) {
  const root = document.documentElement

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  const shouldDark =
    theme === 'dark' ||
    (theme === 'system' && systemDark)

  root.classList.toggle('dark', shouldDark)

  localStorage.setItem('theme', theme)
}

export function initTheme() {
  const stored = (localStorage.getItem('theme') as Theme | null) ?? 'system'

  applyTheme(stored)

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      const current = localStorage.getItem('theme')

      if (current === 'system') {
        applyTheme('system')
      }
    })
}