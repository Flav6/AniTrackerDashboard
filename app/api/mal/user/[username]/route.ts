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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  
  const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID
  
  if (!username) {
    return NextResponse.json({ error: "Username é obrigatório" }, { status: 400 })
  }

  try {
    // Strategy: Try MAL API first for statistics, fallback to Jikan for profile
    // MAL API can fetch animelist but not always user profiles
    
    let malStats = null
    
    // Try to get stats from MAL API if available
    if (MAL_CLIENT_ID) {
      try {
        const malRes = await fetch(
          `https://api.myanimelist.net/v2/users/${encodeURIComponent(username)}?fields=anime_statistics`,
          {
            headers: { "X-MAL-CLIENT-ID": MAL_CLIENT_ID },
          }
        )
        if (malRes.ok) {
          const malData = await malRes.json()
          malStats = malData.anime_statistics
        }
      } catch {
        // MAL API failed, will use Jikan stats
      }
    }
    
    // Always use Jikan for profile data (more reliable for all users)
    const jikanRes = await fetchWithRetry(
      `https://api.jikan.moe/v4/users/${encodeURIComponent(username)}/full`
    )
    
    if (!jikanRes.ok) {
      const errorData = await jikanRes.json().catch(() => ({}))
      
      if (jikanRes.status === 404) {
        return NextResponse.json({ error: "Usuário não encontrado. Verifique se o nome está correto." }, { status: 404 })
      }
      if (jikanRes.status === 500 || errorData.type === "UpstreamException") {
        return NextResponse.json({ 
          error: "O serviço MyAnimeList está temporariamente indisponível. Tente novamente em alguns minutos." 
        }, { status: 503 })
      }
      return NextResponse.json({ error: errorData.message || "Erro ao buscar usuário" }, { status: jikanRes.status })
    }
    
    const jikanData = await jikanRes.json()
    
    if (!jikanData.data) {
      return NextResponse.json({ error: "Dados do usuário não encontrados" }, { status: 404 })
    }
    
    // Use MAL stats if available (more accurate), otherwise use Jikan stats
    const profileData = jikanData.data
    if (malStats) {
      profileData.statistics = {
        anime: {
          days_watched: malStats.num_days_watched || profileData.statistics?.anime?.days_watched || 0,
          mean_score: malStats.mean_score || profileData.statistics?.anime?.mean_score || 0,
          watching: malStats.num_items_watching || profileData.statistics?.anime?.watching || 0,
          completed: malStats.num_items_completed || profileData.statistics?.anime?.completed || 0,
          on_hold: malStats.num_items_on_hold || profileData.statistics?.anime?.on_hold || 0,
          dropped: malStats.num_items_dropped || profileData.statistics?.anime?.dropped || 0,
          plan_to_watch: malStats.num_items_plan_to_watch || profileData.statistics?.anime?.plan_to_watch || 0,
          total_entries: malStats.num_items || profileData.statistics?.anime?.total_entries || 0,
          episodes_watched: malStats.num_episodes || profileData.statistics?.anime?.episodes_watched || 0,
        }
      }
    }
    
    return NextResponse.json({ data: profileData, source: malStats ? "mal+jikan" : "jikan" })
    
  } catch (error) {
    console.error("[MAL API] Error fetching user:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar usuário" },
      { status: 500 }
    )
  }
}
