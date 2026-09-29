import { faArrowLeft, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'

export default function AnimeNotFound() {
  return (
    <div className="state">
      <p><FontAwesomeIcon icon={faTriangleExclamation} /> This anime does not exist.</p>
      <Link href="/search" className="btn"><FontAwesomeIcon icon={faArrowLeft} /> Back to search</Link>
    </div>
  )
}
