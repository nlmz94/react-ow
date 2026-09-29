import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeAnime, makePage } from '@/test/fixtures'
import { SearchView } from './SearchView'

const mocks = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}))

const results = makePage([makeAnime()], { total: 75, pages: 3, page: 1 })

// fireEvent rather than user-event: Testing Library's async wrapper waits on a real
// setTimeout(0), which never fires under Vitest's fake timers.
function type(value: string) {
  fireEvent.change(screen.getByRole('searchbox'), { target: { value } })
}

beforeEach(() => {
  vi.useFakeTimers()
  mocks.replace.mockReset()
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
})

afterEach(() => {
  vi.useRealTimers()
})

describe('SearchView', () => {
  it('replaces the URL 350ms after typing stops', () => {
    render(<SearchView term="" results={results} />)

    for (const value of ['f', 'fri', 'frieren']) {
      type(value)
      act(() => vi.advanceTimersByTime(200))
    }
    // Each keystroke restarted the timer; 200ms have passed since the last one.
    act(() => vi.advanceTimersByTime(149))
    expect(mocks.replace).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(mocks.replace).toHaveBeenCalledTimes(1)
    expect(mocks.replace).toHaveBeenCalledWith('/search?q=frieren', { scroll: false })
  })

  it('searches immediately on submit and does not fire the debounce afterwards', () => {
    render(<SearchView term="" results={results} />)

    type('one')
    fireEvent.submit(screen.getByRole('search'))
    expect(mocks.replace).toHaveBeenCalledWith('/search?q=one', { scroll: false })

    act(() => vi.advanceTimersByTime(1000))
    expect(mocks.replace).toHaveBeenCalledTimes(1)
  })

  it('keeps what the user typed while an earlier search is landing', () => {
    const { rerender } = render(<SearchView term="" results={results} />)
    const input = screen.getByRole('searchbox')

    type('narut')
    act(() => vi.advanceTimersByTime(350))
    expect(mocks.replace).toHaveBeenLastCalledWith('/search?q=narut', { scroll: false })

    type('naruto')
    rerender(<SearchView term="narut" results={results} />) // the first navigation lands
    expect(input).toHaveValue('naruto')

    act(() => vi.advanceTimersByTime(350))
    expect(mocks.replace).toHaveBeenLastCalledWith('/search?q=naruto', { scroll: false })
  })

  it('mirrors an external URL change (Back/Forward) without navigating again', () => {
    const { rerender } = render(<SearchView term="naruto" results={results} />)

    rerender(<SearchView term="bleach" results={results} />)
    expect(screen.getByRole('searchbox')).toHaveValue('bleach')

    act(() => vi.advanceTimersByTime(1000))
    expect(mocks.replace).not.toHaveBeenCalled()
  })

  it('shows the result count for the term', () => {
    render(<SearchView term="naruto" results={results} />)
    expect(screen.getByText(/75 results for “naruto”/)).toBeInTheDocument()
  })

  it('uses the singular for one result', () => {
    render(<SearchView term="" results={makePage([makeAnime()], { total: 1 })} />)
    expect(screen.getByText(/^1 result$/)).toBeInTheDocument()
  })

  it('paginates, dropping page=1 from the URL, and scrolls to the top', () => {
    const { rerender } = render(<SearchView term="naruto" results={results} />)

    expect(screen.getByRole('button', { name: /Prev/ })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(mocks.replace).toHaveBeenLastCalledWith('/search?q=naruto&page=2', { scroll: false })
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })

    rerender(<SearchView term="naruto" results={{ ...results, meta: { ...results.meta, page: 2 } }} />)
    fireEvent.click(screen.getByRole('button', { name: /Prev/ }))
    expect(mocks.replace).toHaveBeenLastCalledWith('/search?q=naruto', { scroll: false })
  })

  it('hides pagination when there is a single page', () => {
    render(<SearchView term="" results={makePage([makeAnime()])} />)
    expect(screen.queryByRole('button', { name: /Next/ })).not.toBeInTheDocument()
  })

  it('shows the error and empty states', () => {
    const { rerender } = render(<SearchView term="x" results={null} />)
    expect(screen.getByText('Could not load results.')).toBeInTheDocument()

    rerender(<SearchView term="x" results={makePage([], { total: 0, pages: 0 })} />)
    expect(screen.getByText('No anime found.')).toBeInTheDocument()
  })
})
