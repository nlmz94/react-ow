import { describe, expect, it } from 'vitest'
import { ACCEPTED_TYPES, MAX_DIMENSION, MAX_SIZE, dimensionsError, fileError } from './image'

describe('fileError', () => {
  it('accepts JPEG, PNG and WebP up to 5 MB inclusive', () => {
    for (const type of ACCEPTED_TYPES) {
      expect(fileError({ type, size: MAX_SIZE })).toBeNull()
    }
  })

  it('rejects other types, including an empty type', () => {
    expect(fileError({ type: 'image/gif', size: 10 })).toBe('Please upload a valid image (JPEG, PNG, or WebP).')
    expect(fileError({ type: '', size: 10 })).toBe('Please upload a valid image (JPEG, PNG, or WebP).')
  })

  it('rejects files one byte over the limit', () => {
    expect(fileError({ type: 'image/png', size: MAX_SIZE + 1 })).toBe('The image must be 5 MB or smaller.')
  })
})

describe('dimensionsError', () => {
  it('accepts exactly the maximum', () => {
    expect(dimensionsError({ width: MAX_DIMENSION, height: MAX_DIMENSION })).toBeNull()
  })

  it('rejects either side over the maximum and reports the actual size', () => {
    expect(dimensionsError({ width: 2001, height: 10 })).toBe('The image cannot exceed 2000×2000px (this one is 2001×10px).')
    expect(dimensionsError({ width: 10, height: 4000 })).toBe('The image cannot exceed 2000×2000px (this one is 10×4000px).')
  })
})
