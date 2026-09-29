import { describe, expect, it } from 'vitest'
import { makeAnimeDetail } from '@/test/fixtures'
import { animeFacts, isAnimeId } from './facts'

function factsOf(overrides: Parameters<typeof makeAnimeDetail>[0]) {
  return Object.fromEntries(animeFacts(makeAnimeDetail(overrides)).map(f => [f.label, f.value]))
}

describe('animeFacts', () => {
  it('lists the facts in the Nuxt order with the Nuxt formatting', () => {
    const facts = animeFacts(makeAnimeDetail({
      pegi: 'PG-13',
      producers: [{ id: 1, name: 'Aniplex' }, { id: 2, name: 'Dentsu' }],
    }))

    expect(facts).toEqual([
      { label: 'Format', value: 'TV' },
      { label: 'Status', value: 'Finished' },
      { label: 'Episodes', value: '28' },
      { label: 'Duration', value: '24 min' },
      { label: 'Season', value: 'Fall 2023' },
      { label: 'Aired', value: '29 Sept 2023 → 22 Mar 2024' },
      { label: 'Source', value: 'Manga' },
      { label: 'Country', value: 'JP' },
      { label: 'Rating', value: 'PG-13' },
      { label: 'Studios', value: 'Madhouse' },
      { label: 'Producers', value: 'Aniplex, Dentsu' },
    ])
  })

  it('drops empty facts but keeps 0 episodes', () => {
    const facts = factsOf({
      format: null, status: null, episodes: 0, duration: null, season: null, seasonYear: null,
      startDate: null, source: null, countryOfOrigin: null, pegi: null, studios: [], producers: [],
    })
    expect(facts).toEqual({ Episodes: '0' })
  })

  it('handles a season without a year, a year without a season, and an open end date', () => {
    expect(factsOf({ season: 'WINTER', seasonYear: null }).Season).toBe('Winter')
    expect(factsOf({ season: null, seasonYear: 2024 }).Season).toBe('2024')
    expect(factsOf({ endDate: null }).Aired).toBe('29 Sept 2023 → ?')
  })
})

describe('isAnimeId', () => {
  it('accepts positive integer strings only', () => {
    expect(isAnimeId('42')).toBe(true)
    for (const id of ['abc', '', '4.2', '-1', '..%2Fhome', '42abc', ' 42']) {
      expect(isAnimeId(id)).toBe(false)
    }
  })
})
