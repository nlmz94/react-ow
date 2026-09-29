'use client'

import { faChevronLeft, faChevronRight, faMagnifyingGlass, faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { faFaceFrown } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition, type SubmitEvent } from 'react'
import { AnimeCard } from '@/components/AnimeCard'
import { formatNumber } from '@/lib/format'
import type { PaginatedAnimes } from '@/lib/types'
import { searchHref } from './params'

const DEBOUNCE_MS = 350

export function SearchView({ term, results }: { term: string, results: PaginatedAnimes | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [input, setInput] = useState(term)
  // The last term this component put in the URL, to tell its own navigations from Back/Forward.
  const [pushed, setPushed] = useState(term)
  const [syncedTerm, setSyncedTerm] = useState(term)

  // When the URL's term changes from outside, mirror it in the input.
  if (term !== syncedTerm) {
    setSyncedTerm(term)
    if (term !== pushed) {
      setInput(term)
      setPushed(term)
    }
  }

  const navigate = useCallback((q: string, page = 1) => {
    setPushed(q.trim())
    startTransition(() => router.replace(searchHref(q, page), { scroll: false }))
  }, [router])

  useEffect(() => {
    const value = input.trim()
    if (value === term || value === pushed) return
    const timer = setTimeout(() => navigate(value), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [input, term, pushed, navigate])

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(input)
  }

  function goTo(page: number) {
    navigate(term, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const meta = results?.meta

  return (
    <div>
      <h1><FontAwesomeIcon icon={faMagnifyingGlass} /> Search</h1>

      <form role="search" onSubmit={onSubmit}>
        <div className="relative">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
          <input
            value={input}
            onChange={event => setInput(event.target.value)}
            className="input pl-10 text-[1.05rem]"
            type="search"
            placeholder="Naruto, Frieren, One Piece…"
            aria-label="Search by title"
            autoFocus
          />
        </div>
      </form>

      {meta && (
        <p className="mt-3 mb-5 text-muted">
          {formatNumber(meta.total)} result{meta.total === 1 ? '' : 's'}
          {term && <> for “{term}”</>}
          {isPending && <> <FontAwesomeIcon icon={faSpinner} spin /></>}
        </p>
      )}

      {!results
        ? <div className="state"><FontAwesomeIcon icon={faTriangleExclamation} /> Could not load results.</div>
        : !results.data.length
            ? <div className="state"><FontAwesomeIcon icon={faFaceFrown} /> No anime found.</div>
            : (
                <>
                  <div className={`grid-cards transition-opacity ${isPending ? 'opacity-60' : ''}`}>
                    {results.data.map(anime => <AnimeCard key={anime.id} anime={anime} />)}
                  </div>

                  {results.meta.pages > 1 && (
                    <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Pagination">
                      <button type="button" className="btn" disabled={results.meta.page <= 1} onClick={() => goTo(results.meta.page - 1)}>
                        <FontAwesomeIcon icon={faChevronLeft} /> Prev
                      </button>
                      <span className="text-muted">Page {results.meta.page} / {results.meta.pages}</span>
                      <button type="button" className="btn" disabled={results.meta.page >= results.meta.pages} onClick={() => goTo(results.meta.page + 1)}>
                        Next <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </nav>
                  )}
                </>
              )}
    </div>
  )
}
