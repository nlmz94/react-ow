'use client'

import { faRotateRight, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect } from 'react'

export default function RootError({ error, retry }: { error: Error & { digest?: string }, retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="state">
      <p><FontAwesomeIcon icon={faTriangleExclamation} /> Something went wrong.</p>
      <button type="button" className="btn" onClick={() => retry()}>
        <FontAwesomeIcon icon={faRotateRight} /> Retry
      </button>
    </div>
  )
}
