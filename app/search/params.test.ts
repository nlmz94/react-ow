import { describe, expect, it } from 'vitest'
import { parseSearchParams, searchHref } from './params'

describe('parseSearchParams', () => {
  it('reads and trims q, and reads page', () => {
    expect(parseSearchParams({ q: '  naruto ', page: '3' })).toEqual({ term: 'naruto', page: 3 })
  })

  it('defaults to no term and page 1', () => {
    expect(parseSearchParams({})).toEqual({ term: '', page: 1 })
    expect(parseSearchParams({ q: '' })).toEqual({ term: '', page: 1 })
  })

  it('ignores repeated q params instead of crashing', () => {
    expect(parseSearchParams({ q: ['a', 'b'] }).term).toBe('')
  })

  it('treats junk pages as page 1', () => {
    for (const page of ['abc', '-2', '0', 'Infinity', '', undefined]) {
      expect(parseSearchParams({ page }).page).toBe(1)
    }
    expect(parseSearchParams({ page: ['2', '3'] }).page).toBe(1)
  })

  it('floors fractional pages', () => {
    expect(parseSearchParams({ page: '2.7' }).page).toBe(2)
  })
})

describe('searchHref', () => {
  it('leaves out an empty term and page 1', () => {
    expect(searchHref('')).toBe('/search')
    expect(searchHref('   ', 1)).toBe('/search')
  })

  it('encodes the trimmed term and pages above 1', () => {
    expect(searchHref(' one piece ')).toBe('/search?q=one+piece')
    expect(searchHref('naruto', 2)).toBe('/search?q=naruto&page=2')
    expect(searchHref('', 4)).toBe('/search?page=4')
  })
})
