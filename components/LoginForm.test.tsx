import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api'
import type { User } from '@/lib/types'
import { makeUser } from '@/test/fixtures'
import { LoginForm } from './LoginForm'

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  auth: { user: null as User | null, login: vi.fn() },
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }))
vi.mock('@/lib/auth', () => ({ useAuth: () => mocks.auth }))

beforeEach(() => {
  mocks.replace.mockReset()
  mocks.auth.user = null
  mocks.auth.login = vi.fn()
})

async function fillAndSubmit(rememberMe = false) {
  await userEvent.type(screen.getByLabelText('Email'), 'fern@example.com')
  await userEvent.type(screen.getByLabelText('Password'), 'Correct-horse7')
  if (rememberMe) await userEvent.click(screen.getByLabelText('Remember me'))
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
}

describe('LoginForm', () => {
  it('logs in with the remember-me flag', async () => {
    mocks.auth.login.mockResolvedValue(makeUser())
    render(<LoginForm />)

    await fillAndSubmit(true)

    expect(mocks.auth.login).toHaveBeenCalledWith('fern@example.com', 'Correct-horse7', true)
  })

  it('shows the API message when login fails', async () => {
    mocks.auth.login.mockRejectedValue(new ApiError(401, { title: 'Unauthorized', status: 401, detail: 'Invalid credentials.' }))
    render(<LoginForm />)

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials.')
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled()
  })

  it('shows the fallback message when the API is unreachable', async () => {
    mocks.auth.login.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<LoginForm />)

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not log in.')
  })

  it('toggles password visibility', async () => {
    render(<LoginForm />)
    const password = screen.getByLabelText('Password')

    expect(password).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
  })

  it('sends a signed-in user to the redirect target', () => {
    mocks.auth.user = makeUser()
    render(<LoginForm redirect="/anime/5" />)
    expect(mocks.replace).toHaveBeenCalledWith('/anime/5')
  })

  it('never follows an off-site redirect', () => {
    mocks.auth.user = makeUser()
    render(<LoginForm redirect="//evil.com" />)
    expect(mocks.replace).toHaveBeenCalledWith('/')
  })

  it('keeps the redirect on the sign-up link', () => {
    render(<LoginForm redirect="/profile" />)
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/register?redirect=%2Fprofile')
  })
})
