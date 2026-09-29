import { faYoutube } from '@fortawesome/free-brands-svg-icons'
import { faArrowUpRightFromSquare, faClapperboard, faHeart, faMasksTheater, faStar, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Fragment, cache } from 'react'
import { AnimePoster } from '@/components/AnimePoster'
import { PeopleList, type PersonItem } from '@/components/PeopleList'
import { ApiError, apiFetch } from '@/lib/api'
import { formatNumber, humanize, plainText } from '@/lib/format'
import type { AnimeDetail } from '@/lib/types'
import { animeFacts, isAnimeId } from './facts'

/** Shared by generateMetadata and the page, so the API is called once per request. */
const getAnime = cache(async (id: string): Promise<AnimeDetail> => {
  if (!isAnimeId(id)) notFound()
  try {
    return (await apiFetch<{ data: AnimeDetail }>(`/animes/${id}`)).data
  }
  catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }
})

export async function generateMetadata({ params }: PageProps<'/anime/[id]'>): Promise<Metadata> {
  const anime = await getAnime((await params).id)
  return { title: anime.titleEnglish || anime.title }
}

export default async function AnimePage({ params }: PageProps<'/anime/[id]'>) {
  const anime = await getAnime((await params).id)
  const title = anime.titleEnglish || anime.title
  const synopsis = plainText(anime.synopsis)
  const facts = animeFacts(anime)

  const characters: PersonItem[] = anime.characters.map(c => ({
    key: String(c.id),
    name: c.name,
    image: c.image,
    role: humanize(c.role),
    voiceActor: c.voiceActor?.name,
  }))
  // Staff can hold the same person twice with different roles.
  const staff: PersonItem[] = anime.staff.map((m, i) => ({
    key: `${m.id}-${i}`,
    name: m.name,
    image: m.image,
    role: m.role ?? '',
  }))

  return (
    <article>
      <div
        className="-mx-4 -mt-6 h-[220px] bg-cover bg-center"
        style={anime.bannerUrl
          ? { backgroundImage: `url(${JSON.stringify(anime.bannerUrl)})` }
          : { background: anime.coverColor || 'var(--surface-2)' }}
      />

      <header className="-mt-20 flex flex-col items-start gap-6 px-2 md:-mt-[110px] md:flex-row md:items-end">
        <AnimePoster
          className="w-[140px] shrink-0 shadow-[0_4px_16px_rgb(0_0_0/0.3)] md:w-[200px]"
          image={anime.images.poster}
          alt={title}
          color={anime.coverColor}
        />
        <div className="min-w-0 pb-2">
          <h1 className="mt-0 mb-1 text-[1.8rem]">{title}</h1>
          {anime.titleEnglish && anime.title !== anime.titleEnglish && <p className="m-0 text-muted">{anime.title}</p>}
          {anime.titleNative && <p className="m-0 text-muted">{anime.titleNative}</p>}

          <div className="my-3 flex flex-wrap gap-4">
            {anime.averageScore ? <span><FontAwesomeIcon icon={faStar} className="text-star" /> {anime.averageScore}%</span> : null}
            {anime.popularity ? <span><FontAwesomeIcon icon={faUsers} className="text-primary" /> {formatNumber(anime.popularity)}</span> : null}
            {anime.favourites ? <span><FontAwesomeIcon icon={faHeart} className="text-danger" /> {formatNumber(anime.favourites)}</span> : null}
          </div>

          {anime.genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {anime.genres.map(genre => <span key={genre} className="tag">{genre}</span>)}
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            {anime.anilistId
              ? (
                  <a href={`https://anilist.co/anime/${anime.anilistId}`} target="_blank" rel="noopener" className="btn">
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} /> AniList
                  </a>
                )
              : null}
            {anime.malId
              ? (
                  <a href={`https://myanimelist.net/anime/${anime.malId}`} target="_blank" rel="noopener" className="btn">
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} /> MyAnimeList
                  </a>
                )
              : null}
          </div>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <aside className="card self-start p-4">
          <dl className="m-0">
            {facts.map(fact => (
              <Fragment key={fact.label}>
                <dt className="text-[0.8rem] font-semibold text-muted">{fact.label}</dt>
                <dd className="mt-0 mb-3 ml-0">{fact.value}</dd>
              </Fragment>
            ))}
          </dl>
        </aside>

        <div className="min-w-0 space-y-8">
          {synopsis && (
            <section>
              <h2 className="mt-0 text-[1.2rem]">Synopsis</h2>
              <p className="whitespace-pre-line">{synopsis}</p>
            </section>
          )}

          {anime.trailerYoutubeId && (
            <section>
              <h2 className="mt-0 text-[1.2rem]"><FontAwesomeIcon icon={faYoutube} /> Trailer</h2>
              <div className="aspect-video max-w-[720px]">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${anime.trailerYoutubeId}`}
                  title="Trailer"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="size-full rounded-card border-0"
                />
              </div>
            </section>
          )}

          {characters.length > 0 && (
            <section>
              <h2 className="mt-0 text-[1.2rem]"><FontAwesomeIcon icon={faMasksTheater} /> Characters</h2>
              <PeopleList people={characters} limit={12} />
            </section>
          )}

          {staff.length > 0 && (
            <section>
              <h2 className="mt-0 text-[1.2rem]"><FontAwesomeIcon icon={faClapperboard} /> Staff</h2>
              <PeopleList people={staff} limit={8} />
            </section>
          )}
        </div>
      </div>
    </article>
  )
}
