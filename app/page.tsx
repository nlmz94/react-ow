import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Form from 'next/form'
import { Suspense } from 'react'
import { LoadingState } from '@/components/LoadingState'
import { HomeContent } from './HomeContent'

export default function HomePage() {
  return (
    <div>
      <section className="pt-8 pb-4 text-center">
        <h1 className="mt-0 mb-4 text-[2rem]">Find your next anime</h1>
        <Form action="/search" className="mx-auto flex max-w-[560px] gap-2">
          <input name="q" className="input" type="search" placeholder="Search by title…" aria-label="Search" />
          <button className="btn btn-primary shrink-0" type="submit">
            <FontAwesomeIcon icon={faMagnifyingGlass} /> Search
          </button>
        </Form>
      </section>

      <Suspense fallback={<LoadingState />}>
        <HomeContent />
      </Suspense>
    </div>
  )
}
