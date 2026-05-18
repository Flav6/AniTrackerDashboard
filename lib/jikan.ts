const JIKAN_BASE_URL = "https://api.jikan.moe/v4"

// Rate limiting helper - Jikan API has a limit of 3 requests per second
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 350 // ms between requests

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }
  
  lastRequestTime = Date.now()
  
  const res = await fetch(url)
  
  // Handle rate limiting
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "2", 10) * 1000
    await new Promise(resolve => setTimeout(resolve, retryAfter))
    return rateLimitedFetch(url)
  }
  
  return res
}

export interface AnimeData {
  mal_id: number
  title: string
  title_english: string | null
  title_japanese: string | null
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
    webp: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  score: number | null
  scored_by: number | null
  rank: number | null
  popularity: number | null
  members: number
  episodes: number | null
  status: string
  rating: string | null
  synopsis: string | null
  genres: Array<{ mal_id: number; name: string }>
  year: number | null
  season: string | null
  type: string | null
  source: string | null
  duration: string | null
  aired: {
    from: string | null
    to: string | null
    string: string | null
  }
}

export interface JikanResponse<T> {
  data: T
  pagination?: {
    last_visible_page: number
    has_next_page: boolean
    current_page: number
    items: {
      count: number
      total: number
      per_page: number
    }
  }
}

export async function fetchTopAnime(page = 1, limit = 24): Promise<JikanResponse<AnimeData[]>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/top/anime?page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error("Falha ao buscar animes populares")
  return res.json()
}

export async function fetchSeasonalAnime(year?: number, season?: string): Promise<JikanResponse<AnimeData[]>> {
  const url = year && season 
    ? `${JIKAN_BASE_URL}/seasons/${year}/${season}` 
    : `${JIKAN_BASE_URL}/seasons/now`
  const res = await rateLimitedFetch(url)
  if (!res.ok) throw new Error("Falha ao buscar animes da temporada")
  return res.json()
}

export async function fetchUpcomingAnime(): Promise<JikanResponse<AnimeData[]>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/seasons/upcoming?limit=24`)
  if (!res.ok) throw new Error("Falha ao buscar próximos animes")
  return res.json()
}

export async function searchAnime(query: string): Promise<JikanResponse<AnimeData[]>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=24`)
  if (!res.ok) throw new Error("Falha ao buscar animes")
  return res.json()
}

export async function fetchAnimeById(id: number): Promise<JikanResponse<AnimeData>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}`)
  if (!res.ok) throw new Error("Falha ao buscar detalhes do anime")
  return res.json()
}

// Fetch anime full details (includes relations, themes, etc.)
export async function fetchAnimeFullById(id: number): Promise<JikanResponse<AnimeData & {
  trailer: {
    youtube_id: string | null
    url: string | null
    embed_url: string | null
  }
  studios: Array<{ mal_id: number; name: string }>
  producers: Array<{ mal_id: number; name: string }>
  licensors: Array<{ mal_id: number; name: string }>
  themes: Array<{ mal_id: number; name: string }>
  demographics: Array<{ mal_id: number; name: string }>
  relations: Array<{
    relation: string
    entry: Array<{ mal_id: number; type: string; name: string; url: string }>
  }>
  theme: {
    openings: string[]
    endings: string[]
  }
  external: Array<{ name: string; url: string }>
  streaming: Array<{ name: string; url: string }>
}>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}/full`)
  if (!res.ok) throw new Error("Falha ao buscar detalhes completos do anime")
  return res.json()
}

// Fetch anime videos (trailers, promos, etc.)
export interface AnimeVideo {
  promo: Array<{
    title: string
    trailer: {
      youtube_id: string
      url: string
      embed_url: string
      images: {
        image_url: string
        small_image_url: string
        medium_image_url: string
        large_image_url: string
        maximum_image_url: string
      }
    }
  }>
  episodes: Array<{
    mal_id: number
    title: string
    episode: string
    url: string
    images: {
      jpg: { image_url: string }
    }
  }>
  music_videos: Array<{
    title: string
    video: {
      youtube_id: string
      url: string
      embed_url: string
      images: {
        image_url: string
        small_image_url: string
        medium_image_url: string
        large_image_url: string
        maximum_image_url: string
      }
    }
    meta: {
      title: string
      author: string
    }
  }>
}

export async function fetchAnimeVideos(id: number): Promise<JikanResponse<AnimeVideo>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}/videos`)
  if (!res.ok) throw new Error("Falha ao buscar vídeos do anime")
  return res.json()
}

// Fetch anime pictures
export interface AnimePicture {
  jpg: {
    image_url: string
    small_image_url: string
    large_image_url: string
  }
  webp: {
    image_url: string
    small_image_url: string
    large_image_url: string
  }
}

export async function fetchAnimePictures(id: number): Promise<JikanResponse<AnimePicture[]>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}/pictures`)
  if (!res.ok) throw new Error("Falha ao buscar imagens do anime")
  return res.json()
}

// Fetch anime characters
export interface AnimeCharacter {
  character: {
    mal_id: number
    url: string
    images: {
      jpg: { image_url: string }
      webp: { image_url: string; small_image_url: string }
    }
    name: string
  }
  role: string
  voice_actors: Array<{
    person: {
      mal_id: number
      url: string
      images: { jpg: { image_url: string } }
      name: string
    }
    language: string
  }>
}

export async function fetchAnimeCharacters(id: number): Promise<JikanResponse<AnimeCharacter[]>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}/characters`)
  if (!res.ok) throw new Error("Falha ao buscar personagens do anime")
  return res.json()
}

// Fetch anime staff
export interface AnimeStaff {
  person: {
    mal_id: number
    url: string
    images: { jpg: { image_url: string } }
    name: string
  }
  positions: string[]
}

export async function fetchAnimeStaff(id: number): Promise<JikanResponse<AnimeStaff[]>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}/staff`)
  if (!res.ok) throw new Error("Falha ao buscar equipe do anime")
  return res.json()
}

// Fetch anime recommendations
export interface AnimeRecommendation {
  entry: {
    mal_id: number
    url: string
    images: {
      jpg: { image_url: string; large_image_url: string }
      webp: { image_url: string; large_image_url: string }
    }
    title: string
  }
  votes: number
}

export async function fetchAnimeRecommendations(id: number): Promise<JikanResponse<AnimeRecommendation[]>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}/recommendations`)
  if (!res.ok) throw new Error("Falha ao buscar recomendações")
  return res.json()
}

export type AnimeCategory = "top" | "seasonal" | "upcoming" | "mylist" | "favorites"

export interface UserAnimeListEntry {
  entry: {
    mal_id: number
    url: string
    images: {
      jpg: {
        image_url: string
        small_image_url: string
        large_image_url: string
      }
      webp: {
        image_url: string
        small_image_url: string
        large_image_url: string
      }
    }
    title: string
    type: string | null
    episodes: number | null
    status: string
    score: number
    year: number | null
  }
  score: number
  status: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch"
  episodes_watched: number
}

export interface UserProfile {
  mal_id: number
  username: string
  url: string
  images: {
    jpg: {
      image_url: string
    }
    webp: {
      image_url: string
    }
  }
  last_online: string
  gender: string | null
  birthday: string | null
  location: string | null
  joined: string
  statistics: {
    anime: {
      days_watched: number
      mean_score: number
      watching: number
      completed: number
      on_hold: number
      dropped: number
      plan_to_watch: number
      total_entries: number
      episodes_watched: number
    }
  }
}

export async function fetchUserProfile(username: string): Promise<JikanResponse<UserProfile>> {
  // Use internal API route to avoid CORS and support both Jikan and MAL APIs
  const res = await fetch(`/api/mal/user/${encodeURIComponent(username)}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    if (res.status === 404) throw new Error(errorData.error || "Usuário não encontrado. Verifique se o nome está correto.")
    if (res.status === 400) throw new Error(errorData.error || "Nome de usuário inválido.")
    if (res.status === 429) throw new Error("Muitas requisições. Aguarde um momento e tente novamente.")
    if (res.status === 503) throw new Error(errorData.error || "Serviço temporariamente indisponível. Tente novamente.")
    throw new Error(errorData.error || "Falha ao buscar perfil do usuário. Tente novamente.")
  }
  const json = await res.json()
  return { data: json.data }
}

export async function fetchUserAnimeList(
  username: string, 
  status?: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch",
  page = 1
): Promise<JikanResponse<UserAnimeListEntry[]>> {
  // Use internal API route to avoid CORS and support both Jikan and MAL APIs
  let url = `/api/mal/user/${encodeURIComponent(username)}/animelist?page=${page}`
  if (status) {
    url += `&status=${status}`
  }
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    if (res.status === 404) throw new Error(errorData.error || "Usuário não encontrado ou lista privada")
    if (res.status === 403) throw new Error(errorData.error || "A lista de animes deste usuário é privada. Configure sua lista como pública no MAL.")
    if (res.status === 400) throw new Error(errorData.error || "Requisição inválida. Verifique o nome de usuário.")
    if (res.status === 429) throw new Error("Muitas requisições. Aguarde um momento e tente novamente.")
    if (res.status === 503) throw new Error(errorData.error || "Serviço temporariamente indisponível. Tente novamente.")
    throw new Error(errorData.error || "Falha ao buscar lista de animes. Verifique se a lista está pública.")
  }
  const json = await res.json()
  return { data: json.data || [] }
}

// Fetch user's favorites
export async function fetchUserFavorites(username: string): Promise<JikanResponse<{
  anime: Array<{
    mal_id: number
    url: string
    images: { jpg: { image_url: string } }
    title: string
  }>
}>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/users/${encodeURIComponent(username)}/favorites`)
  if (!res.ok) {
    throw new Error("Falha ao buscar favoritos")
  }
  return res.json()
}

// Fetch user's history
export async function fetchUserHistory(username: string): Promise<JikanResponse<Array<{
  entry: {
    mal_id: number
    url: string
    images: { jpg: { image_url: string } }
    title: string
  }
  increment: number
  date: string
}>>> {
  const res = await rateLimitedFetch(`${JIKAN_BASE_URL}/users/${encodeURIComponent(username)}/history?type=anime`)
  if (!res.ok) {
    throw new Error("Falha ao buscar histórico")
  }
  return res.json()
}

export type AnimeListStatus = "all" | "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch"

export const statusLabels: Record<AnimeListStatus, string> = {
  all: "Todos",
  watching: "Assistindo",
  completed: "Completos",
  on_hold: "Em Pausa",
  dropped: "Abandonados",
  plan_to_watch: "Planejados"
}
