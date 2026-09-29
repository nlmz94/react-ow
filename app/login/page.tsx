import type { Metadata } from 'next'
import { LoginForm } from '@/components/LoginForm'

export const metadata: Metadata = { title: 'Log in' }

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { redirect } = await searchParams
  return <LoginForm redirect={typeof redirect === 'string' ? redirect : undefined} />
}
