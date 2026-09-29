'use client'

import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth'

export function Providers({ children }: { children: ReactNode }) {
  return (
    // Stored under localStorage "theme" with values light/dark, like the Nuxt app, so saved choices carry over.
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}
