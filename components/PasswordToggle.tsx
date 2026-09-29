import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export function PasswordToggle({ shown, onToggle }: { shown: boolean, onToggle: () => void }) {
  const label = shown ? 'Hide password' : 'Show password'
  return (
    <button type="button" className="btn btn-icon" title={label} aria-label={label} onClick={onToggle}>
      <FontAwesomeIcon icon={shown ? faEyeSlash : faEye} />
    </button>
  )
}
