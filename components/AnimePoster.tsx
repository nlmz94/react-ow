import { faImage } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ImageVariant } from '@/lib/types'

export function AnimePoster({ image, alt, color, className = '' }: {
  image: ImageVariant | null
  alt: string
  color?: string | null
  className?: string
}) {
  return (
    <div
      className={`grid aspect-[414/616] place-items-center overflow-hidden rounded-card ${className}`}
      style={{ background: color || 'var(--surface-2)' }}
    >
      {image
        ? (
            <picture className="size-full">
              <source srcSet={image.webp} type="image/webp" />
              <img src={image.default} alt={alt} loading="lazy" className="size-full object-cover" />
            </picture>
          )
        : <FontAwesomeIcon icon={faImage} className="text-[2rem] text-muted" />}
    </div>
  )
}
