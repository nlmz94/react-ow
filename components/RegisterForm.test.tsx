import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api'
import type { User } from '@/lib/types'
import { makeUser } from '@/test/fixtures'
import { RegisterForm } from './RegisterForm'

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  auth: { user: null as User | null, register: vi.fn(), login: vi.fn() },
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }))
vi.mock('@/lib/auth', () => ({ useAuth: () => mocks.auth }))

const STRONG = 'Correct-horse7'

beforeEach(() => {
  mocks.replace.mockReset()
  mocks.auth.user = null
  mocks.auth.register = vi.fn()
  mocks.auth.login = vi.fn()
})

async function fill(email: string, password: string, confirm: string) {
  if (email) await userEvent.type(screen.getByLabelText('Email'), email)
  if (password) await userEvent.type(screen.getByLabelText('Password'), password)
  if (confirm) await userEvent.type(screen.getByLabelText('Confirm password'), confirm)
}

const submit = () => userEvent.click(screen.getByRole('button', { name: 'Create account' }))
const rule = (label: string) => screen.getByText(label).closest('li')!

describe('RegisterForm', () => {
  it('updates the password rules while typing', async () => {
    render(<RegisterForm />)
    expect(rule('An uppercase letter')).not.toHaveClass('text-success')

    await userEvent.type(screen.getByLabelText('Password'), 'A')
    expect(rule('An uppercase letter')).toHaveClass('text-success')
    expect(rule('At least 12 characters')).not.toHaveClass('text-success')
  })

  it('flags a mismatched confirmation while typing', async () => {
    render(<RegisterForm />)
    await fill('', STRONG, 'Correct-horse')
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Confirm password'), '7')
    expect(screen.queryByText('Passwords do not match.')).not.toBeInTheDocument()
  })

  it('blocks a weak password before calling the API', async () => {
    render(<RegisterForm />)
    await fill('fern@example.com', 'weak', 'weak')
    await submit()

    expect(screen.getByText('Your password does not meet the requirements.')).toBeInTheDocument()
    expect(mocks.auth.register).not.toHaveBeenCalled()
  })

  it('registers, then logs the new user in', async () => {
    mocks.auth.register.mockResolvedValue(makeUser())
    mocks.auth.login.mockResolvedValue(makeUser())
    render(<RegisterForm />)

    await fill('fern@example.com', STRONG, STRONG)
    await submit()

    expect(mocks.auth.register).toHaveBeenCalledWith('fern@example.com', STRONG)
    expect(mocks.auth.login).toHaveBeenCalledWith('fern@example.com', STRONG)
  })

  it('maps API violations onto their fields without a generic alert', async () => {
    mocks.auth.register.mockRejectedValue(new ApiError(422, {
      title: 'Validation Failed',
      status: 422,
      violations: [{ propertyPath: 'email', title: 'This email is already used.' }],
    }))
    render(<RegisterForm />)

    await fill('fern@example.com', STRONG, STRONG)
    await submit()

    expect(await screen.findByText('This email is already used.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a generic alert for errors without violations', async () => {
    mocks.auth.register.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<RegisterForm />)

    await fill('fern@example.com', STRONG, STRONG)
    await submit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not create your account.')
  })

  it('sends an already signed-in user home', () => {
    mocks.auth.user = makeUser()
    render(<RegisterForm />)
    expect(mocks.replace).toHaveBeenCalledWith('/')
  })
})
