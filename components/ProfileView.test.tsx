import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/lib/types'
import { makeUser } from '@/test/fixtures'
import { ProfileView } from './ProfileView'

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  apiFetch: vi.fn(),
  readImageSize: vi.fn(),
  auth: { user: null as User | null, ready: true, setUser: vi.fn() },
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }))
vi.mock('@/lib/auth', () => ({ useAuth: () => mocks.auth }))
vi.mock('@/lib/api', () => ({ apiFetch: mocks.apiFetch }))
vi.mock('@/lib/image', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/image')>(),
  readImageSize: mocks.readImageSize,
}))

beforeEach(() => {
  mocks.replace.mockReset()
  mocks.apiFetch.mockReset()
  mocks.readImageSize.mockReset()
  mocks.auth.user = makeUser()
  mocks.auth.ready = true
  mocks.auth.setUser = vi.fn()
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})

function choose(file: File) {
  fireEvent.change(document.querySelector('input[type="file"]')!, { target: { files: [file] } })
}

describe('ProfileView', () => {
  it('sends a signed-out visitor to login, then back here', () => {
    mocks.auth.user = null
    render(<ProfileView />)
    expect(mocks.replace).toHaveBeenCalledWith('/login?redirect=/profile')
  })

  it('waits for auth before deciding', () => {
    mocks.auth.user = null
    mocks.auth.ready = false
    render(<ProfileView />)
    expect(mocks.replace).not.toHaveBeenCalled()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows the account details', () => {
    mocks.auth.user = makeUser({ username: 'Frieren', roles: ['ROLE_USER', 'ROLE_ADMIN'] })
    render(<ProfileView />)
    expect(screen.getByRole('heading', { name: 'Frieren' })).toBeInTheDocument()
    expect(screen.getByText(/frieren@example.com/)).toBeInTheDocument()
    expect(screen.getByText(/Member since 15 Jan 2024/)).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('rejects an unsupported file type without reading it', () => {
    render(<ProfileView />)
    choose(new File(['gif'], 'cat.gif', { type: 'image/gif' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Please upload a valid image (JPEG, PNG, or WebP).')
    expect(mocks.readImageSize).not.toHaveBeenCalled()
  })

  it('rejects an oversized image and frees its preview URL', async () => {
    mocks.readImageSize.mockResolvedValue({ width: 2500, height: 100 })
    render(<ProfileView />)
    choose(new File(['png'], 'big.png', { type: 'image/png' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('The image cannot exceed 2000×2000px (this one is 2500×100px).')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
  })

  it('uploads a valid image and updates the signed-in user', async () => {
    const updated = makeUser({ profilePic: { default: '/p.png', webp: '/p.webp' } })
    mocks.readImageSize.mockResolvedValue({ width: 300, height: 300 })
    mocks.apiFetch.mockResolvedValue({ data: updated })
    render(<ProfileView />)

    choose(new File(['png'], 'me.png', { type: 'image/png' }))
    expect(await screen.findByAltText('Preview')).toHaveAttribute('src', 'blob:preview')
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

    await waitFor(() => expect(mocks.auth.setUser).toHaveBeenCalledWith(updated))
    const [path, init] = mocks.apiFetch.mock.calls[0]
    expect(path).toBe('/me/profile-picture')
    expect(init.method).toBe('POST')
    expect((init.body as FormData).get('profile_picture')).toBeInstanceOf(File)
    expect(await screen.findByText('Profile picture updated.')).toBeInTheDocument()
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
  })
})
