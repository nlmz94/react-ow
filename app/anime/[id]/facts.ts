import { formatDate, humanize } from '@/lib/format'
import type { AnimeDetail } from '@/lib/types'

export interface Fact {
  label: string
  value: string
}

export function animeFacts(a: AnimeDetail): Fact[] {
  const facts: [string, string | number | null][] = [
    ['Format', humanize(a.format)],
    ['Status', humanize(a.status)],
    ['Episodes', a.episodes],
    ['Duration', a.duration ? `${a.duration} min` : null],
    ['Season', a.season || a.seasonYear ? `${humanize(a.season)} ${a.seasonYear ?? ''}`.trim() : null],
    ['Aired', a.startDate ? `${formatDate(a.startDate)} → ${a.endDate ? formatDate(a.endDate) : '?'}` : null],
    ['Source', humanize(a.source)],
    ['Country', a.countryOfOrigin],
    ['Rating', a.pegi],
    ['Studios', a.studios.map(s => s.name).join(', ')],
    ['Producers', a.producers.map(p => p.name).join(', ')],
  ]
  return facts
    .filter(([, value]) => value !== null && value !== '')
    .map(([label, value]) => ({ label, value: String(value) }))
}

/** The API only routes numeric ids; anything else is a 404 without a round trip. */
export function isAnimeId(id: string): boolean {
  return /^\d+$/.test(id)
}
