import { NextResponse } from "next/server"

// Helper function to retry requests
async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000),
      })
      
      if (res.status >= 500 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }
      
      return res
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }
  
  throw lastError || new Error("Request failed after retries")
}

interface AnimeListItem {
  entry: {
    mal_id: number
    url: string
    images: {
      jpg: { image_url: string; small_image_url: string; large_image_url: string }
      webp: { image_url: string; small_image_url: string; large_image_url: string }
    }
    title: string
    type: string | null
    episodes: number | null
    status: string
    score: number
    year: number | null
  }
  score: number
  status: string
  episodes_watched: number
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  
  if (!username) {
    return NextResponse.json({ error: "Username é obrigatório" }, { status: 400 })
  }

  // Check for MAL_CLIENT_ID at runtime
  const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID
  const USE_MAL_API = !!MAL_CLIENT_ID

  try {
    if (!USE_MAL_API) {
      // Use Jikan API as fallback
      let url = `https://api.jikan.moe/v4/users/${encodeURIComponent(username)}/animelist?limit=300`
      if (status && status !== "all") {
        url += `&status=${status}`
      }
      
      const res = await fetchWithRetry(url)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        
        if (res.status === 404) {
          return NextResponse.json({ error: "Usuário não encontrado ou lista privada" }, { status: 404 })
        }
        if (res.status === 403) {
          return NextResponse.json({ error: "Lista de animes privada. Configure sua lista como pública no MAL." }, { status: 403 })
        }
        if (res.status === 500 || errorData.type === "UpstreamException") {
          return NextResponse.json({ 
            error: "O serviço MyAnimeList está temporariamente indisponível. Tente novamente em alguns minutos." 
          }, { status: 503 })
        }
        return NextResponse.json({ error: errorData.message || "Erro ao buscar lista" }, { status: res.status })
      }
      
      const data = await res.json()
      return NextResponse.json({ data: data.data || [], source: "jikan" })
    } else {
      // Use official MAL API
      const statusMap: Record<string, string> = {
        watching: "watching",
        completed: "completed",
        on_hold: "on_hold",
        dropped: "dropped",
        plan_to_watch: "plan_to_watch",
      }
      
      let url = `https://api.myanimelist.net/v2/users/${encodeURIComponent(username)}/animelist?limit=100&fields=list_status,num_episodes,media_type,status`
      if (status && status !== "all" && statusMap[status]) {
        url += `&status=${statusMap[status]}`
      }
      
      const res = await fetch(url, {
        headers: {
          "X-MAL-CLIENT-ID": MAL_CLIENT_ID!,
        },
        next: { revalidate: 60 },
      })
      
      if (!res.ok) {
        if (res.status === 404) {
          return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
        }
        if (res.status === 403) {
          return NextResponse.json({ error: "Lista de animes privada" }, { status: 403 })
        }
        return NextResponse.json({ error: "Erro ao buscar lista" }, { status: res.status })
      }
      
      const data = await res.json()
      
      // Transform MAL API response to match our format
      const transformedData: AnimeListItem[] = (data.data || []).map((item: {
        node: {
          id: number
          title: string
          main_picture?: { medium?: string; large?: string }
          media_type?: string
          num_episodes?: number
          status?: string
          start_season?: { year?: number }
          mean?: number
        }
        list_status: {
          status: string
          score: number
          num_episodes_watched: number
        }
      }) => ({
        entry: {
          mal_id: item.node.id,
          url: `https://myanimelist.net/anime/${item.node.id}`,
          images: {
            jpg: {
              image_url: item.node.main_picture?.medium || "",
              small_image_url: item.node.main_picture?.medium || "",
              large_image_url: item.node.main_picture?.large || "",
            },
            webp: {
              image_url: item.node.main_picture?.medium || "",
              small_image_url: item.node.main_picture?.medium || "",
              large_image_url: item.node.main_picture?.large || "",
            },
          },
          title: item.node.title,
          type: item.node.media_type || null,
          episodes: item.node.num_episodes || null,
          status: item.node.status || "",
          score: item.node.mean || 0,
          year: item.node.start_season?.year || null,
        },
        score: item.list_status.score || 0,
        status: item.list_status.status,
        episodes_watched: item.list_status.num_episodes_watched || 0,
      }))
      
      return NextResponse.json({ data: transformedData, source: "mal" })
    }
  } catch (error) {
    console.error("[MAL API] Error fetching animelist:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar lista" },
      { status: 500 }
    )
  }
}
