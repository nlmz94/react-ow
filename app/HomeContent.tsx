import { faBuilding, faClock, faFilm, faFire, faTags, faTriangleExclamation, faTrophy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connection } from 'next/server'
import { AnimeCard } from '@/components/AnimeCard'
import { RetryButton } from '@/components/RetryButton'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/format'
import type { HomeData } from '@/lib/types'

/** Stats and the three carousels; errors are handled here so the hero above stays usable. */
export async function HomeContent() {
  // Render per request; without this the page (and the API data) is frozen at build time.
  await connection()

  let home: HomeData
  try {
    home = (await apiFetch<{ data: HomeData }>('/home')).data
  }
  catch (error) {
    console.error(error)
    return (
      <div className="state">
        <p><FontAwesomeIcon icon={faTriangleExclamation} /> Could not load the home page.</p>
        <RetryButton />
      </div>
    )
  }

  const sections = [
    { key: 'trending', title: 'Trending', icon: faFire, items: home.trending },
    { key: 'topRated', title: 'Top rated', icon: faTrophy, items: home.topRated },
    { key: 'recent', title: 'Recently aired', icon: faClock, items: home.recent },
  ]

  return (
    <>
      <p className="mt-0 flex flex-wrap justify-center gap-5 text-muted">
        <span><FontAwesomeIcon icon={faFilm} /> {formatNumber(home.stats.animes)} anime</span>
        <span><FontAwesomeIcon icon={faTags} /> {formatNumber(home.stats.genres)} genres</span>
        <span><FontAwesomeIcon icon={faBuilding} /> {formatNumber(home.stats.studios)} studios</span>
      </p>

      {sections.map(section => (
        <section key={section.key} className="mt-8">
          <h2 className="text-[1.3rem]"><FontAwesomeIcon icon={section.icon} className="text-primary" /> {section.title}</h2>
          {section.items.length
            ? <div className="grid-cards">{section.items.map(anime => <AnimeCard key={anime.id} anime={anime} />)}</div>
            : <p className="text-muted">Nothing here yet.</p>}
        </section>
      ))}
    </>
  )
}
