export const SEARCH_LIMIT = 30

type RawSearchParams = Record<string, string | string[] | undefined>

/** The URL is the source of truth for search, so it must survive anything a user can type into it. */
export function parseSearchParams(params: RawSearchParams): { term: string, page: number } {
  const term = typeof params.q === 'string' ? params.q.trim() : ''
  const n = typeof params.page === 'string' ? Math.floor(Number(params.page)) : Number.NaN
  const page = Number.isFinite(n) && n > 1 ? n : 1
  return { term, page }
}

/** Builds a /search URL, leaving out defaults. */
export function searchHref(term: string, page = 1): string {
  const query = new URLSearchParams()
  if (term.trim()) query.set('q', term.trim())
  if (page > 1) query.set('page', String(page))
  const qs = query.toString()
  return qs ? `/search?${qs}` : '/search'
}
