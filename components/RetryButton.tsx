'use client'

import { faRotateRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

/** Re-runs the current route's Server Components. */
export function RetryButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button type="button" className="btn" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
      <FontAwesomeIcon icon={faRotateRight} spin={pending} /> Retry
    </button>
  )
}
