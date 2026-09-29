'use client'

import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}

/** False during SSR and hydration, true afterwards (the resolved theme is only known in the browser). */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = useHydrated() && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      className="btn btn-icon"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      <FontAwesomeIcon icon={dark ? faSun : faMoon} />
    </button>
  )
}
