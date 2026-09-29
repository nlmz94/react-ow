import { describe, expect, it } from 'vitest'
import { apiErrorMessage, apiFieldErrors, formatDate, formatNumber, humanize, plainText, safeRedirect } from './format'

describe('humanize', () => {
  it('title-cases words and joins underscores', () => {
    expect(humanize('FINISHED')).toBe('Finished')
    expect(humanize('NOT_YET_RELEASED')).toBe('Not Yet Released')
  })

  it('keeps known acronyms upper-case', () => {
    expect(humanize('TV_SHORT')).toBe('TV Short')
    expect(humanize('OVA')).toBe('OVA')
    expect(humanize('ONA')).toBe('ONA')
  })

  it('returns an empty string for missing values', () => {
    expect(humanize(null)).toBe('')
    expect(humanize(undefined)).toBe('')
    expect(humanize('')).toBe('')
  })
})

describe('formatDate', () => {
  it('formats as a short en-GB date, in UTC', () => {
    expect(formatDate('2024-04-05')).toBe('5 Apr 2024')
    expect(formatDate('2024-04-05T23:30:00Z')).toBe('5 Apr 2024')
  })

  it('returns ? for missing values', () => {
    expect(formatDate(null)).toBe('?')
    expect(formatDate(undefined)).toBe('?')
  })
})

describe('formatNumber', () => {
  it('uses en-US grouping', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatNumber(0)).toBe('0')
  })
})

describe('plainText', () => {
  it('turns <br> into newlines and strips other tags', () => {
    expect(plainText('Line one<br>Line <i>two</i><br />three')).toBe('Line one\nLine two\nthree')
  })

  it('decodes the common entities', () => {
    expect(plainText('Tom &amp; Jerry &quot;quoted&quot; it&#039;s &#39;ok&#39; &lt;3 &gt;')).toBe('Tom & Jerry "quoted" it\'s \'ok\' <3 >')
  })

  it('collapses three or more newlines and trims', () => {
    expect(plainText('  a<br><br><br><br>b  ')).toBe('a\n\nb')
  })

  it('returns an empty string for missing values', () => {
    expect(plainText(null)).toBe('')
  })
})

describe('apiErrorMessage', () => {
  it('prefers detail, then title, then the fallback', () => {
    expect(apiErrorMessage({ data: { title: 'Bad', status: 400, detail: 'Invalid credentials.' } })).toBe('Invalid credentials.')
    expect(apiErrorMessage({ data: { title: 'Bad Request', status: 400 } })).toBe('Bad Request')
    expect(apiErrorMessage({}, 'Could not log in.')).toBe('Could not log in.')
  })

  it('falls back for non-API errors (network failure, null)', () => {
    expect(apiErrorMessage(new TypeError('Failed to fetch'), 'Could not log in.')).toBe('Could not log in.')
    expect(apiErrorMessage(null)).toBe('Something went wrong. Please try again.')
  })
})

describe('apiFieldErrors', () => {
  it('maps violations to { field: message }', () => {
    const error = {
      data: {
        title: 'Validation Failed',
        status: 422,
        violations: [
          { propertyPath: 'email', title: 'This email is already used.' },
          { propertyPath: 'password', title: 'Too weak.' },
        ],
      },
    }
    expect(apiFieldErrors(error)).toEqual({ email: 'This email is already used.', password: 'Too weak.' })
  })

  it('returns an empty object when there are no violations', () => {
    expect(apiFieldErrors(new Error('boom'))).toEqual({})
    expect(apiFieldErrors(undefined)).toEqual({})
  })
})

describe('safeRedirect', () => {
  it('keeps in-app paths', () => {
    expect(safeRedirect('/profile')).toBe('/profile')
    expect(safeRedirect('/search?q=naruto')).toBe('/search?q=naruto')
  })

  it('rejects anything that could leave the app', () => {
    expect(safeRedirect('//evil.com')).toBe('/')
    expect(safeRedirect('/\\evil.com')).toBe('/')
    expect(safeRedirect('https://evil.com')).toBe('/')
    expect(safeRedirect('profile')).toBe('/')
  })

  it('rejects paths that URL parsing turns into another origin (tab/newline stripping)', () => {
    expect(safeRedirect('/\t/evil.com')).toBe('/')
    expect(safeRedirect('/\n/evil.com')).toBe('/')
    expect(safeRedirect('/\r\n/evil.com')).toBe('/')
  })

  it('keeps the query and hash of in-app paths', () => {
    expect(safeRedirect('/anime/5?tab=staff#cast')).toBe('/anime/5?tab=staff#cast')
  })

  it('rejects non-strings', () => {
    expect(safeRedirect(undefined)).toBe('/')
    expect(safeRedirect(['/a', '/b'])).toBe('/')
  })
})
