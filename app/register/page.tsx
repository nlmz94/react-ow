import type { Metadata } from 'next'
import { RegisterForm } from '@/components/RegisterForm'

export const metadata: Metadata = { title: 'Sign up' }

export default async function RegisterPage({ searchParams }: PageProps<'/register'>) {
  const { redirect } = await searchParams
  return <RegisterForm redirect={typeof redirect === 'string' ? redirect : undefined} />
}
