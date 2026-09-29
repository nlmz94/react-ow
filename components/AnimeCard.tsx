import { faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { humanize } from '@/lib/format'
import type { Anime } from '@/lib/types'
import { AnimePoster } from './AnimePoster'

export function AnimeCard({ anime }: { anime: Anime }) {
  const name = anime.titleEnglish || anime.title

  return (
    <Link href={`/anime/${anime.id}`} className="group flex flex-col gap-2 text-text hover:no-underline">
      <AnimePoster image={anime.images.poster} alt={anime.title} color={anime.coverColor} />
      <div>
        <h3 className="m-0 line-clamp-2 text-[0.95rem] font-semibold group-hover:text-primary" title={name}>{name}</h3>
        <p className="mt-0.5 mb-0 text-[0.8rem] text-muted">
          {anime.format ? <span>{humanize(anime.format)}</span> : null}
          {anime.seasonYear ? <span> · {anime.seasonYear}</span> : null}
          {anime.averageScore
            ? <span> · <FontAwesomeIcon icon={faStar} className="text-star" /> {anime.averageScore}%</span>
            : null}
        </p>
      </div>
    </Link>
  )
}
