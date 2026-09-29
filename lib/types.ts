export interface ImageVariant {
  default: string
  webp: string
}

export interface Anime {
  id: number
  title: string
  titleEnglish: string | null
  format: string | null
  status: string | null
  episodes: number | null
  season: string | null
  seasonYear: number | null
  averageScore: number | null
  popularity: number | null
  isAdult: boolean
  pegi: string | null
  coverColor: string | null
  genres: string[]
  images: {
    thumb: ImageVariant | null
    poster: ImageVariant | null
  }
}

export interface Person {
  id: number
  name: string
  language?: string | null
  image: string | null
}

export interface AnimeCharacter extends Person {
  role: string | null
  gender: string | null
  voiceActor: Person | null
}

export interface AnimeStaff extends Person {
  role: string | null
}

export interface AnimeDetail extends Anime {
  anilistId: number | null
  malId: number | null
  titleRomaji: string | null
  titleNative: string | null
  synopsis: string | null
  duration: number | null
  source: string | null
  startDate: string | null
  endDate: string | null
  countryOfOrigin: string | null
  meanScore: number | null
  favourites: number | null
  airing: unknown
  aired: boolean
  trailerYoutubeId: string | null
  updatedAt: string | null
  bannerUrl: string | null
  producers: { id: number, name: string }[]
  studios: { id: number, name: string }[]
  characters: AnimeCharacter[]
  staff: AnimeStaff[]
}

export interface HomeData {
  stats: { animes: number, genres: number, studios: number }
  trending: Anime[]
  topRated: Anime[]
  recent: Anime[]
}

export interface PaginatedAnimes {
  data: Anime[]
  meta: { total: number, pages: number, page: number, limit: number }
}

export interface User {
  id: number
  email: string
  username: string | null
  roles: string[]
  createdAt: string | null
  profilePic: ImageVariant | null
}

/** RFC 7807-style error body returned by the API. */
export interface ApiProblem {
  title: string
  status: number
  detail?: string
  violations?: { propertyPath: string, title: string }[]
}
