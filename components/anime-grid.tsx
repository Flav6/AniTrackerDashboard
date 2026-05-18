"use client"

import useSWR from "swr"
import { AnimeCard } from "./anime-card"
import { AnimeDetailPage } from "./anime-detail-page"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTopAnime, fetchSeasonalAnime, fetchUpcomingAnime, type AnimeCategory, type AnimeData } from "@/lib/jikan"
import { useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnimeGridProps {
  category: AnimeCategory
  searchQuery?: string
}

const fetchers = {
  top: () => fetchTopAnime().then(res => res.data),
  seasonal: () => fetchSeasonalAnime().then(res => res.data),
  upcoming: () => fetchUpcomingAnime().then(res => res.data),
}

// Helper to deduplicate animes by mal_id
function deduplicateAnimes(animes: AnimeData[]): AnimeData[] {
  const seen = new Set<number>()
  return animes.filter((anime) => {
    if (seen.has(anime.mal_id)) {
      return false
    }
    seen.add(anime.mal_id)
    return true
  })
}

export function AnimeGrid({ category, searchQuery }: AnimeGridProps) {
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null)
  
  const { data: animes, error, isLoading, mutate } = useSWR(
    searchQuery ? null : `anime-${category}`,
    () => fetchers[category](),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl overflow-hidden">
            <Skeleton className="aspect-[3/4] bg-muted/30" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Erro ao carregar animes
        </h3>
        <p className="text-muted-foreground mb-4">
          Não foi possível carregar os dados. Tente novamente.
        </p>
        <Button onClick={() => mutate()} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!animes || animes.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Nenhum anime encontrado.</p>
      </div>
    )
  }

  // Deduplicate animes to avoid duplicate key errors
  const uniqueAnimes = deduplicateAnimes(animes)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {uniqueAnimes.map((anime, index) => (
          <AnimeCard 
            key={`${anime.mal_id}-${index}`} 
            anime={anime} 
            onClick={() => setSelectedAnimeId(anime.mal_id)}
          />
        ))}
      </div>

      {selectedAnimeId && (
        <AnimeDetailPage 
          animeId={selectedAnimeId}
          onClose={() => setSelectedAnimeId(null)}
          onAnimeSelect={(id) => setSelectedAnimeId(id)}
        />
      )}
    </>
  )
}
