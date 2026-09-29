import type { Metadata } from 'next'
import { apiFetch } from '@/lib/api'
import type { PaginatedAnimes } from '@/lib/types'
import { SEARCH_LIMIT, parseSearchParams } from './params'
import { SearchView } from './SearchView'

export const metadata: Metadata = { title: 'Search' }

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { term, page } = parseSearchParams(await searchParams)

  const query = new URLSearchParams({ page: String(page), limit: String(SEARCH_LIMIT) })
  if (term) query.set('searchTerm', term)

  let results: PaginatedAnimes | null = null
  try {
    results = await apiFetch<PaginatedAnimes>(`/animes?${query}`)
  }
  catch (error) {
    // Rendered as an error state inside SearchView so the search box stays usable.
    console.error(error)
  }

  return <SearchView term={term} results={results} />
}
