import Image from 'next/image'
import type { ImageVariant } from '@/lib/types'

export function UserAvatar({ image, size = 32 }: { image: ImageVariant | null, size?: number }) {
  const isDefault = !image || image.default.endsWith('/images/defaultProfileImage.png')

  return (
    <span
      className="inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-surface-2 text-muted"
      style={{ width: size, height: size }}
    >
      {isDefault
        ? (
            <>
              <Image src="/images/defaultProfileImage-light.png" alt="" width={size} height={size} className="light-only size-full object-cover" />
              <Image src="/images/defaultProfileImage-dark.png" alt="" width={size} height={size} className="dark-only size-full object-cover" />
            </>
          )
        : (
            <picture className="size-full">
              <source srcSet={image.webp} type="image/webp" />
              <img src={image.default} alt="" className="size-full object-cover" />
            </picture>
          )}
    </span>
  )
}
