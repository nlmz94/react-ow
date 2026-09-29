// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE, ApiError, apiFetch } from './api'

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

function lastCall() {
  const [url, init] = fetchMock.mock.calls.at(-1)!
  return { url, init: init!, headers: new Headers(init!.headers) }
}

describe('apiFetch', () => {
  it('defaults to the local Symfony API', () => {
    expect(API_BASE).toBe('http://localhost:8000/api')
  })

  it('GETs the path with credentials and a JSON Accept header, returning parsed JSON', async () => {
    fetchMock.mockResolvedValue(Response.json({ data: { id: 1 } }))

    await expect(apiFetch('/me')).resolves.toEqual({ data: { id: 1 } })

    const { url, init, headers } = lastCall()
    expect(url).toBe('http://localhost:8000/api/me')
    expect(init.credentials).toBe('include')
    expect(headers.get('Accept')).toBe('application/json')
    expect(init.body).toBeUndefined()
  })

  it('JSON-encodes a plain object body', async () => {
    fetchMock.mockResolvedValue(Response.json({ data: {} }))

    await apiFetch('/auth/login', { method: 'POST', body: { email: 'a@b.c', password: 'pw' } })

    const { init, headers } = lastCall()
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"email":"a@b.c","password":"pw"}')
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('passes FormData through untouched and lets fetch set the multipart header', async () => {
    fetchMock.mockResolvedValue(Response.json({ data: {} }))
    const body = new FormData()
    body.append('profile_picture', new Blob(['x'], { type: 'image/png' }), 'a.png')

    await apiFetch('/me/profile-picture', { method: 'POST', body })

    const { init, headers } = lastCall()
    expect(init.body).toBe(body)
    expect(headers.has('Content-Type')).toBe(false)
  })

  it('resolves undefined for an empty 204 response', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(apiFetch('/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('throws an ApiError carrying the RFC 7807 body on failure', async () => {
    const problem = { title: 'Unauthorized', status: 401, detail: 'Invalid credentials.' }
    fetchMock.mockResolvedValue(Response.json(problem, { status: 401 }))

    const error = await apiFetch<never>('/auth/login').catch((e: ApiError) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(401)
    expect(error.data).toEqual(problem)
    expect(error.message).toBe('Invalid credentials.')
  })

  it('throws an ApiError without data when the error body is not JSON (e.g. an HTML error page)', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Oops</html>', { status: 500, headers: { 'Content-Type': 'text/html' } }))

    const error = await apiFetch<never>('/home').catch((e: ApiError) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(500)
    expect(error.data).toBeUndefined()
    expect(error.message).toBe('Request failed with status 500')
  })

  it('lets network failures propagate as-is', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))

    await expect(apiFetch('/home')).rejects.toThrow(TypeError)
  })
})
