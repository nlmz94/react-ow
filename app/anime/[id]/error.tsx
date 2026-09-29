'use client'

import { faArrowLeft, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { useEffect } from 'react'

export default function AnimeError({ error }: { error: Error & { digest?: string }, retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="state">
      <p><FontAwesomeIcon icon={faTriangleExclamation} /> Could not load this anime.</p>
      <Link href="/search" className="btn"><FontAwesomeIcon icon={faArrowLeft} /> Back to search</Link>
    </div>
  )
}
