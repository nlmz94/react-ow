'use client'

import { faRightToBracket, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type SubmitEvent } from 'react'
import { useAuth } from '@/lib/auth'
import { apiErrorMessage, safeRedirect } from '@/lib/format'
import { PasswordToggle } from './PasswordToggle'

export function LoginForm({ redirect }: { redirect?: string }) {
  const router = useRouter()
  const { user, login } = useAuth()
  const target = safeRedirect(redirect)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Covers both "already signed in" and "just signed in".
  useEffect(() => {
    if (user) router.replace(target)
  }, [user, router, target])

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password, rememberMe)
      // Stay in the loading state; the effect above navigates away.
    }
    catch (e) {
      setError(apiErrorMessage(e, 'Could not log in.'))
      setLoading(false)
    }
  }

  return (
    <div className="card mx-auto my-8 max-w-[420px] p-7">
      <h1 className="mt-0 text-2xl"><FontAwesomeIcon icon={faRightToBracket} /> Log in</h1>

      {error && <div className="alert" role="alert">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="flex gap-2">
            <input
              id="password"
              className="input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <PasswordToggle shown={showPassword} onToggle={() => setShowPassword(v => !v)} />
          </div>
        </div>

        <label className="mb-5 flex items-center gap-2">
          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /> Remember me
        </label>

        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          <FontAwesomeIcon icon={loading ? faSpinner : faRightToBracket} spin={loading} /> Log in
        </button>
      </form>

      <p className="mb-0 text-center text-muted">
        No account yet? <Link href={{ pathname: '/register', query: redirect ? { redirect } : {} }}>Sign up</Link>
      </p>
    </div>
  )
}
