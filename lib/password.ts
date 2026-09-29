export interface PasswordRule {
  label: string
  ok: boolean
}

/** Mirrors the API's StrongPassword constraint so users get feedback while typing. */
export function passwordRules(password: string): PasswordRule[] {
  return [
    { label: 'At least 12 characters', ok: password.length >= 12 },
    { label: 'An uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'A lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'A number', ok: /\d/.test(password) },
    { label: 'A special character', ok: /[^A-Za-z0-9]/.test(password) },
  ]
}

export function isStrongPassword(password: string): boolean {
  return passwordRules(password).every(rule => rule.ok)
}
