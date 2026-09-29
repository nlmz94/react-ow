import type { Anime, AnimeDetail, PaginatedAnimes, User } from '@/lib/types'

export function makeAnime(overrides: Partial<Anime> = {}): Anime {
  return {
    id: 1,
    title: 'Sousou no Frieren',
    titleEnglish: 'Frieren: Beyond Journey’s End',
    format: 'TV',
    status: 'FINISHED',
    episodes: 28,
    season: 'FALL',
    seasonYear: 2023,
    averageScore: 91,
    popularity: 350000,
    isAdult: false,
    pegi: null,
    coverColor: '#e4a15d',
    genres: ['Adventure', 'Drama', 'Fantasy'],
    images: { thumb: null, poster: null },
    ...overrides,
  }
}

export function makeAnimeDetail(overrides: Partial<AnimeDetail> = {}): AnimeDetail {
  return {
    ...makeAnime(),
    anilistId: 154587,
    malId: 52991,
    titleRomaji: 'Sousou no Frieren',
    titleNative: '葬送のフリーレン',
    synopsis: null,
    duration: 24,
    source: 'MANGA',
    startDate: '2023-09-29',
    endDate: '2024-03-22',
    countryOfOrigin: 'JP',
    meanScore: 91,
    favourites: 50000,
    airing: null,
    aired: true,
    trailerYoutubeId: null,
    updatedAt: null,
    bannerUrl: null,
    producers: [],
    studios: [{ id: 1, name: 'Madhouse' }],
    characters: [],
    staff: [],
    ...overrides,
  }
}

export function makePage(data: Anime[], meta: Partial<PaginatedAnimes['meta']> = {}): PaginatedAnimes {
  return { data, meta: { total: data.length, pages: 1, page: 1, limit: 30, ...meta } }
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: 'frieren@example.com',
    username: null,
    roles: ['ROLE_USER'],
    createdAt: '2024-01-15T10:00:00Z',
    profilePic: null,
    ...overrides,
  }
}
