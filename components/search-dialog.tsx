"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Star, Tv, Calendar } from "lucide-react"
import { searchAnime, type AnimeData } from "@/lib/jikan"
import { AnimeDetailModal } from "./anime-detail-modal"
import { AnimeDetailPage } from "./anime-detail-page"

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

// Lightweight search result card - much faster than full AnimeCard
const SearchResultCard = memo(function SearchResultCard({ 
  anime, 
  onClick 
}: { 
  anime: AnimeData
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="flex gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors duration-100 text-left w-full"
    >
      <img
        src={anime.images.jpg.image_url}
        alt={anime.title}
        loading="lazy"
        className="w-12 h-16 object-cover rounded shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{anime.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {anime.score && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              {anime.score}
            </span>
          )}
          {anime.type && (
            <span className="flex items-center gap-1">
              <Tv className="w-3 h-3" />
              {anime.type}
            </span>
          )}
          {anime.year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {anime.year}
            </span>
          )}
        </div>
        {anime.episodes && (
          <p className="text-xs text-muted-foreground mt-0.5">{anime.episodes} eps</p>
        )}
      </div>
    </button>
  )
})

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AnimeData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAnime, setSelectedAnime] = useState<AnimeData | null>(null)
  const [fullDetailsAnimeId, setFullDetailsAnimeId] = useState<number | null>(null)

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setQuery("")
      setResults([])
      return
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await searchAnime(query)
        setResults(response.data.slice(0, 20)) // Limit results for performance
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 400) // Slightly faster debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleAnimeClick = useCallback((anime: AnimeData) => {
    onClose() // Close search dialog first
    setSelectedAnime(anime)
  }, [onClose])

  const handleCloseDialog = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <>
      <Dialog open={open} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg max-h-[70vh] p-0 glass-panel border-border/40 flex flex-col overflow-hidden">
          <DialogTitle className="sr-only">Buscar animes</DialogTitle>
          <DialogDescription className="sr-only">
            Digite para buscar animes no catálogo MyAnimeList
          </DialogDescription>
          
          {/* Search Input */}
          <div className="p-4 border-b border-border/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar animes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-10 glass-input border-border/40 focus:border-primary"
                autoFocus
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
              )}
            </div>
          </div>

          {/* Results - Simple list for performance */}
          <div className="flex-1 overflow-y-auto p-2">
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((anime, idx) => (
                  <SearchResultCard
                    key={`${anime.mal_id}-${idx}`}
                    anime={anime}
                    onClick={() => handleAnimeClick(anime)}
                  />
                ))}
              </div>
            ) : query && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado para &quot;{query}&quot;
                </p>
              </div>
            ) : !query ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Digite para buscar
                </p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AnimeDetailModal 
        anime={selectedAnime} 
        open={!!selectedAnime} 
        onClose={() => setSelectedAnime(null)}
        onViewFullDetails={(animeId) => {
          setSelectedAnime(null)
          setFullDetailsAnimeId(animeId)
        }}
      />

      {fullDetailsAnimeId && (
        <AnimeDetailPage 
          animeId={fullDetailsAnimeId}
          onClose={() => setFullDetailsAnimeId(null)}
          onAnimeSelect={(id) => setFullDetailsAnimeId(id)}
        />
      )}
    </>
  )
}
