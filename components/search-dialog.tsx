"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { searchAnime, type AnimeData } from "@/lib/jikan"
import { AnimeCard } from "./anime-card"
import { AnimeDetailModal } from "./anime-detail-modal"
import { AnimeDetailPage } from "./anime-detail-page"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AnimeData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAnime, setSelectedAnime] = useState<AnimeData | null>(null)
  const [fullDetailsAnimeId, setFullDetailsAnimeId] = useState<number | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await searchAnime(query)
        setResults(response.data)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleAnimeClick = (anime: AnimeData) => {
    setSelectedAnime(anime)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 glass-panel border-border/40 flex flex-col overflow-hidden">
          <DialogTitle className="sr-only">Buscar animes</DialogTitle>
          <DialogDescription className="sr-only">
            Digite para buscar animes no catálogo MyAnimeList
          </DialogDescription>
          
          {/* Search Input */}
          <div className="p-4 border-b border-border/30 bg-background/30 backdrop-blur-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar animes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 glass-input border-border/40 focus:border-primary focus:ring-primary/20"
                autoFocus
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
              )}
            </div>
          </div>

          {/* Results */}
          <ScrollArea className="flex-1 p-4">
            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.map((anime, idx) => (
                  <AnimeCard 
                    key={`${anime.mal_id}-${idx}`} 
                    anime={anime} 
                    onClick={() => handleAnimeClick(anime)}
                  />
                ))}
              </div>
            ) : query && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Nenhum anime encontrado para &quot;{query}&quot;
                </p>
              </div>
            ) : !query ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Digite para buscar animes
                </p>
              </div>
            ) : null}
          </ScrollArea>
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

      {/* Full Details Page */}
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
