import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export function LoadingState() {
  return (
    <div className="state">
      <FontAwesomeIcon icon={faSpinner} spin /> Loading…
    </div>
  )
}
