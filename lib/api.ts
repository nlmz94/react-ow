import type { ApiProblem } from './types'

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api'

/** A non-2xx API response; `data` is the RFC 7807 body when the API sent one. */
export class ApiError extends Error {
  readonly status: number
  readonly data?: ApiProblem

  constructor(status: number, data?: ApiProblem) {
    super(data?.detail || data?.title || `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export interface ApiRequestInit extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | FormData
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  }
  catch {
    return undefined
  }
}

/**
 * Calls the Symfony API from Server or Client Components. The session cookie
 * lives on the API origin, so browser calls must include credentials.
 */
export async function apiFetch<T = unknown>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { body, headers: initHeaders, ...rest } = init
  const headers = new Headers(initHeaders)
  headers.set('Accept', 'application/json')

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  }
  else if (body !== undefined) {
    payload = JSON.stringify(body)
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers, body: payload, credentials: 'include' })
  const text = await res.text()
  const data = text ? parseJson(text) : undefined

  if (!res.ok) {
    throw new ApiError(res.status, data && typeof data === 'object' ? data as ApiProblem : undefined)
  }
  return data as T
}
