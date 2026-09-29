import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import type { Metadata } from 'next'
import { Nav } from '@/components/Nav'
import './globals.css'
import { Providers } from './providers'

// The icon CSS is imported above, so Font Awesome must not inject it again at runtime.
config.autoAddCss = false

export const metadata: Metadata = {
  title: { default: 'OnlyWeebs', template: '%s · OnlyWeebs' },
  icons: { icon: '/favicon.ico', apple: '/images/favicon.png' },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // next-themes sets data-theme on <html> before hydration.
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Nav />
          <main className="app-container pt-6 pb-12">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
