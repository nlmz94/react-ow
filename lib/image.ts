// Mirrors the API's constraints on POST /api/me/profile-picture.
export const MAX_SIZE = 5 * 1024 * 1024
export const MAX_DIMENSION = 2000
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface ImageSize {
  width: number
  height: number
}

export function fileError(file: Pick<File, 'type' | 'size'>): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Please upload a valid image (JPEG, PNG, or WebP).'
  if (file.size > MAX_SIZE) return 'The image must be 5 MB or smaller.'
  return null
}

export function dimensionsError({ width, height }: ImageSize): string | null {
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    return `The image cannot exceed ${MAX_DIMENSION}×${MAX_DIMENSION}px (this one is ${width}×${height}px).`
  }
  return null
}

/** Browser-only: loads an (object) URL and resolves its natural size; rejects if it isn't a readable image. */
export function readImageSize(url: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = url
  })
}
