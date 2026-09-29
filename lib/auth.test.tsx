import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeUser } from '@/test/fixtures'
import { apiFetch } from './api'
import { AuthProvider, useAuth } from './auth'

vi.mock('./api', async importOriginal => ({
  ...await importOriginal<typeof import('./api')>(),
  apiFetch: vi.fn(),
}))

const apiFetchMock = vi.mocked(apiFetch)

function Probe() {
  const { user, ready, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="ready">{String(ready)}</span>
      <span data-testid="user">{user?.email ?? 'none'}</span>
      <button onClick={() => login('fern@example.com', 'pw', true)}>login</button>
      <button onClick={() => logout().catch(() => {})}>logout</button>
    </div>
  )
}

function renderProbe() {
  return render(<AuthProvider><Probe /></AuthProvider>)
}

beforeEach(() => {
  apiFetchMock.mockReset()
})

describe('AuthProvider', () => {
  it('starts not ready, then loads the current user from /me', async () => {
    apiFetchMock.mockResolvedValue({ data: makeUser() })

    renderProbe()
    expect(screen.getByTestId('ready')).toHaveTextContent('false')

    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))
    expect(screen.getByTestId('user')).toHaveTextContent('frieren@example.com')
    expect(apiFetchMock).toHaveBeenCalledWith('/me')
  })

  it('treats a failed /me as signed out', async () => {
    apiFetchMock.mockRejectedValue(new Error('401'))

    renderProbe()

    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('logs in with _remember_me and stores the returned user', async () => {
    apiFetchMock.mockRejectedValueOnce(new Error('401'))
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))

    apiFetchMock.mockResolvedValueOnce({ data: makeUser({ email: 'fern@example.com' }) })
    await userEvent.click(screen.getByText('login'))

    expect(apiFetchMock).toHaveBeenLastCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'fern@example.com', password: 'pw', _remember_me: true },
    })
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('fern@example.com'))
  })

  it('clears the user on logout even when the API call fails', async () => {
    apiFetchMock.mockResolvedValueOnce({ data: makeUser() })
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('frieren@example.com'))

    apiFetchMock.mockRejectedValueOnce(new Error('500'))
    await userEvent.click(screen.getByText('logout'))

    expect(apiFetchMock).toHaveBeenLastCalledWith('/auth/logout', { method: 'POST' })
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'))
  })

  it('throws a clear error when useAuth is used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow('useAuth must be used inside <AuthProvider>')
  })
})
