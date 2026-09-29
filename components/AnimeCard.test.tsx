import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeAnime } from '@/test/fixtures'
import { AnimeCard } from './AnimeCard'

describe('AnimeCard', () => {
  it('links to the detail page and shows the English title with format, year and score', () => {
    render(<AnimeCard anime={makeAnime({ id: 42, format: 'TV_SHORT' })} />)

    expect(screen.getByRole('link')).toHaveAttribute('href', '/anime/42')
    expect(screen.getByRole('heading', { name: 'Frieren: Beyond Journey’s End' })).toBeInTheDocument()
    expect(screen.getByText('TV Short')).toBeInTheDocument()
    expect(screen.getByText(/· 2023/)).toBeInTheDocument()
    expect(screen.getByText(/91%/)).toBeInTheDocument()
  })

  it('falls back to the romaji title and hides missing meta, including a 0 score', () => {
    render(<AnimeCard anime={makeAnime({ titleEnglish: null, format: null, seasonYear: null, averageScore: 0 })} />)

    expect(screen.getByRole('heading', { name: 'Sousou no Frieren' })).toBeInTheDocument()
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows a placeholder icon when there is no poster, and a <picture> when there is', () => {
    const { container, rerender } = render(<AnimeCard anime={makeAnime()} />)
    expect(container.querySelector('picture')).toBeNull()

    rerender(<AnimeCard anime={makeAnime({ images: { thumb: null, poster: { default: '/p.jpg', webp: '/p.webp' } } })} />)
    expect(container.querySelector('source')).toHaveAttribute('srcset', '/p.webp')
    expect(screen.getByRole('img', { name: 'Sousou no Frieren' })).toHaveAttribute('src', '/p.jpg')
  })
})
