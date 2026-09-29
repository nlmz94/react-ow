'use client'

import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { faCircleCheck, faSpinner, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type SubmitEvent } from 'react'
import { useAuth } from '@/lib/auth'
import { apiErrorMessage, apiFieldErrors } from '@/lib/format'
import { isStrongPassword, passwordRules } from '@/lib/password'
import { PasswordToggle } from './PasswordToggle'

export function RegisterForm({ redirect }: { redirect?: string }) {
  const router = useRouter()
  const { user, register, login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const rules = passwordRules(password)
  const confirmMismatch = confirm !== '' && confirm !== password

  // Covers both "already signed in" and "just registered and signed in".
  useEffect(() => {
    if (user) router.replace('/')
  }, [user, router])

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    if (!isStrongPassword(password)) {
      setFieldErrors({ password: 'Your password does not meet the requirements.' })
      return
    }
    if (password !== confirm) {
      setFieldErrors({ confirm: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try {
      await register(email, password)
      // Sign the new user straight in; the effect above then navigates home.
      await login(email, password)
    }
    catch (e) {
      const fields = apiFieldErrors(e)
      setFieldErrors(fields)
      if (!Object.keys(fields).length) setError(apiErrorMessage(e, 'Could not create your account.'))
      setLoading(false)
    }
  }

  return (
    <div className="card mx-auto my-8 max-w-[420px] p-7">
      <h1 className="mt-0 text-2xl"><FontAwesomeIcon icon={faUserPlus} /> Sign up</h1>

      {error && <div className="alert" role="alert">{error}</div>}

      <form noValidate onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="flex gap-2">
            <input
              id="password"
              className="input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <PasswordToggle shown={showPassword} onToggle={() => setShowPassword(v => !v)} />
          </div>
          <ul className="mt-1 mb-0 list-none p-0 text-[0.85rem] text-muted">
            {rules.map(r => (
              <li key={r.label} className={r.ok ? 'text-success' : undefined}>
                <FontAwesomeIcon icon={r.ok ? faCircleCheck : faCircle} /> {r.label}
              </li>
            ))}
          </ul>
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </div>

        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            className="input"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
          {(fieldErrors.confirm || confirmMismatch) && (
            <span className="field-error">{fieldErrors.confirm || 'Passwords do not match.'}</span>
          )}
        </div>

        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          <FontAwesomeIcon icon={loading ? faSpinner : faUserPlus} spin={loading} /> Create account
        </button>
      </form>

      <p className="mb-0 text-center text-muted">
        Already have an account? <Link href={{ pathname: '/login', query: redirect ? { redirect } : {} }}>Log in</Link>
      </p>
    </div>
  )
}
