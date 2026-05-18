"use client"

import useSWR from "swr"
import { fetchUserFavorites } from "@/lib/jikan"
import { Loader2, Heart, AlertCircle, ExternalLink, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { fetchAnimeById, type AnimeData } from "@/lib/jikan"
import { AnimeDetailModal } from "@/components/anime-detail-modal"

interface FavoritesGridProps {
  username: string
}

export function FavoritesGrid({ username }: FavoritesGridProps) {
  const [selectedAnimeData, setSelectedAnimeData] = useState<AnimeData | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    username ? [`user-favorites`, username] : null,
    () => fetchUserFavorites(username),
    { 
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  )

  const handleAnimeClick = async (animeId: number) => {
    setLoadingDetails(true)
    try {
      const response = await fetchAnimeById(animeId)
      setSelectedAnimeData(response.data)
    } catch (err) {
      console.error("Error fetching anime details:", err)
    } finally {
      setLoadingDetails(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando favoritos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center py-20 gap-4 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="space-y-2">
          <p className="text-foreground font-medium">Erro ao carregar favoritos</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => mutate()}
          className="mt-4 gap-2"
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  const favorites = data?.data?.anime || []

  if (favorites.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center py-20 gap-4 text-center">
        <Heart className="w-12 h-12 text-muted-foreground" />
        <div>
          <p className="text-foreground font-medium">Nenhum favorito encontrado</p>
          <p className="text-sm text-muted-foreground">
            Adicione animes aos seus favoritos no MyAnimeList!
          </p>
        </div>
        <a 
          href={`https://myanimelist.net/profile/${username}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Ir para o perfil MAL
          </Button>
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Seus Favoritos</h2>
            <p className="text-sm text-muted-foreground">{favorites.length} animes favoritados</p>
          </div>
        </div>
        <a 
          href={`https://myanimelist.net/profile/${username}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            Editar no MAL
          </Button>
        </a>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {favorites.map((anime) => (
          <div
            key={anime.mal_id}
            onClick={() => handleAnimeClick(anime.mal_id)}
            className="glass-card rounded-xl overflow-hidden group cursor-pointer hover:scale-[1.02] hover:shadow-[0_8px_30px_oklch(0.35_0.12_var(--theme-hue,350)_/_0.3)] hover:border-primary/30 transition-all duration-300"
          >
            <div className="relative aspect-[3/4]">
              <img
                src={anime.images.jpg.image_url}
                alt={anime.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              
              {/* Favorite Badge */}
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>

              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 text-balance group-hover:text-primary transition-colors">
                  {anime.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Anime Detail Modal */}
      <AnimeDetailModal 
        anime={selectedAnimeData} 
        open={selectedAnimeData !== null} 
        onClose={() => setSelectedAnimeData(null)}
      />

      {/* Loading overlay for details */}
      {loadingDetails && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-6 rounded-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-foreground">Carregando detalhes...</span>
          </div>
        </div>
      )}
    </div>
  )
}
