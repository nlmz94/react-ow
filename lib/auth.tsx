'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiFetch } from './api'
import type { User } from './types'

interface AuthContextValue {
  user: User | null
  /** False until the first /me call settles. */
  ready: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>
  register: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  // The session cookie lives on the API origin, so the user is loaded in the browser.
  useEffect(() => {
    let cancelled = false
    apiFetch<{ data: User }>('/me')
      .then((res) => {
        if (!cancelled) setUser(res.data)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const res = await apiFetch<{ data: User }>('/auth/login', {
      method: 'POST',
      body: { email, password, _remember_me: rememberMe },
    })
    setUser(res.data)
    return res.data
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ data: User }>('/auth/register', {
      method: 'POST',
      body: { email, password },
    })
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    }
    finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, ready, login, register, logout, setUser }),
    [user, ready, login, register, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
