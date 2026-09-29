import { describe, expect, it } from 'vitest'
import { isStrongPassword, passwordRules } from './password'

function okLabels(password: string) {
  return passwordRules(password).filter(r => r.ok).map(r => r.label)
}

describe('passwordRules', () => {
  it('lists the five rules in order, all failing for an empty password', () => {
    expect(passwordRules('')).toEqual([
      { label: 'At least 12 characters', ok: false },
      { label: 'An uppercase letter', ok: false },
      { label: 'A lowercase letter', ok: false },
      { label: 'A number', ok: false },
      { label: 'A special character', ok: false },
    ])
  })

  it('checks each rule independently', () => {
    expect(okLabels('abcdefghijkl')).toEqual(['At least 12 characters', 'A lowercase letter'])
    expect(okLabels('A')).toEqual(['An uppercase letter'])
    expect(okLabels('7')).toEqual(['A number'])
    expect(okLabels('!')).toEqual(['A special character'])
    expect(okLabels('é')).toEqual(['A special character'])
  })

  it('needs exactly 12 characters, not 11', () => {
    expect(okLabels('aaaaaaaaaaa')).not.toContain('At least 12 characters')
    expect(okLabels('aaaaaaaaaaaa')).toContain('At least 12 characters')
  })
})

describe('isStrongPassword', () => {
  it('is true only when every rule passes', () => {
    expect(isStrongPassword('Correct-horse7')).toBe(true)
    expect(isStrongPassword('correct-horse7')).toBe(false)
    expect(isStrongPassword('Short-7a')).toBe(false)
  })
})
