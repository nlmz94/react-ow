import type { ApiProblem } from './types'

const ACRONYMS = new Set(['TV', 'OVA', 'ONA'])

/** "TV_SHORT" -> "TV Short", "FINISHED" -> "Finished" */
export function humanize(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .split('_')
    .map(word => ACRONYMS.has(word) ? word : word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

/** Formatted in UTC so date-only API values ("2024-04-05") never shift by a day. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '?'
  return new Date(value).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

/** Fixed locale so server-rendered and hydrated output always match. */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

/** AniList synopses contain a little HTML (<br>, <i>); render them as plain text. */
export function plainText(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, '\'')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function problemOf(error: unknown): ApiProblem | undefined {
  return (error as { data?: ApiProblem } | null | undefined)?.data
}

/** Pulls a readable message out of a failed API call. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const data = problemOf(error)
  return data?.detail || data?.title || fallback
}

/** Maps API validation violations to { field: message }. */
export function apiFieldErrors(error: unknown): Record<string, string> {
  const violations = problemOf(error)?.violations ?? []
  return Object.fromEntries(violations.map(v => [v.propertyPath, v.title]))
}

/** Only follows in-app paths; "//host" and "/\host" are treated by browsers as other origins. */
export function safeRedirect(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
    ? value
    : '/'
}
