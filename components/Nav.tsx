'use client'

import { faHouse, faMagnifyingGlass, faRightFromBracket, faRightToBracket, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { ThemeToggle } from './ThemeToggle'
import { UserAvatar } from './UserAvatar'

const LINKS = [
  { href: '/', label: 'Home', icon: faHouse },
  { href: '/search', label: 'Search', icon: faMagnifyingGlass },
]

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, ready, logout } = useAuth()

  async function onLogout() {
    try {
      await logout()
    }
    catch {
      // The user is cleared locally even if the API call fails.
    }
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <div className="app-container flex h-15 items-center gap-3 sm:gap-6">
        <Link href="/" className="shrink-0" aria-label="OnlyWeebs home">
          <Image src="/images/ow-smol-text-light.webp" alt="OnlyWeebs" width={872} height={206} preload className="light-only h-7.5 w-auto" />
          <Image src="/images/ow-smol-text-dark.webp" alt="OnlyWeebs" width={872} height={206} preload className="dark-only h-7.5 w-auto" />
        </Link>

        <nav className="flex gap-4">
          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'font-semibold text-text' : 'text-muted'}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              <FontAwesomeIcon icon={link.icon} /> <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Nothing auth-related until /me settles; server and first client render match. */}
          {ready && (user
            ? (
                <>
                  <Link href="/profile" title={user.email} className="group mr-1 flex max-w-[220px] items-center gap-2 text-text hover:no-underline">
                    <UserAvatar image={user.profilePic} size={28} />
                    <span className="hidden truncate group-hover:underline sm:inline">{user.username || user.email}</span>
                  </Link>
                  <button type="button" className="btn btn-icon" title="Log out" aria-label="Log out" onClick={onLogout}>
                    <FontAwesomeIcon icon={faRightFromBracket} />
                  </button>
                </>
              )
            : (
                <>
                  <Link href="/login" className="btn">
                    <FontAwesomeIcon icon={faRightToBracket} /> <span className="hidden sm:inline">Log in</span>
                  </Link>
                  <Link href="/register" className="btn btn-primary">
                    <FontAwesomeIcon icon={faUserPlus} /> <span className="hidden sm:inline">Sign up</span>
                  </Link>
                </>
              ))}

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
