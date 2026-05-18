"use client"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star, Calendar, Users, Trophy, Clock, Tv, BookOpen, ExternalLink, Play, ImageIcon, UsersRound } from "lucide-react"
import type { AnimeData } from "@/lib/jikan"
import { Button } from "@/components/ui/button"

interface AnimeDetailModalProps {
  anime: AnimeData | null
  open: boolean
  onClose: () => void
  onViewFullDetails?: (animeId: number) => void
}

export function AnimeDetailModal({ anime, open, onClose, onViewFullDetails }: AnimeDetailModalProps) {
  if (!anime) return null

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden glass-panel border-border/40 modal-enter">
        <DialogTitle className="sr-only">{anime.title_english || anime.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Detalhes do anime {anime.title_english || anime.title}
        </DialogDescription>
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-1/3 aspect-[3/4] md:aspect-auto shrink-0 img-zoom">
            <img
              src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
              alt={anime.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent md:bg-gradient-to-r md:from-background md:via-background/30 md:to-transparent" />
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1 text-balance">
                  {anime.title_english || anime.title}
                </h2>
                {anime.title_japanese && (
                  <p className="text-sm text-muted-foreground">{anime.title_japanese}</p>
                )}
              </div>
              {anime.score && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  {anime.score.toFixed(2)}
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {anime.rank && (
                <div className="glass-card rounded-lg p-2.5 text-center hover-lift animate-fade-in" style={{ animationDelay: '50ms' }}>
                  <Trophy className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Rank</p>
                  <p className="text-sm font-semibold text-foreground">#{anime.rank}</p>
                </div>
              )}
              {anime.popularity && (
                <div className="glass-card rounded-lg p-2.5 text-center hover-lift animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Popularidade</p>
                  <p className="text-sm font-semibold text-foreground">#{anime.popularity}</p>
                </div>
              )}
              {anime.members && (
                <div className="glass-card rounded-lg p-2.5 text-center hover-lift animate-fade-in" style={{ animationDelay: '150ms' }}>
                  <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Membros</p>
                  <p className="text-sm font-semibold text-foreground">{formatNumber(anime.members)}</p>
                </div>
              )}
              {anime.episodes && (
                <div className="glass-card rounded-lg p-2.5 text-center hover-lift animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <Tv className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Episódios</p>
                  <p className="text-sm font-semibold text-foreground">{anime.episodes}</p>
                </div>
              )}
            </div>

            {/* Info Row */}
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.type && (
                <Badge variant="outline" className="gap-1 bg-secondary/50 backdrop-blur-sm border-border/50">
                  <Tv className="w-3 h-3" />
                  {anime.type}
                </Badge>
              )}
              {anime.status && (
                <Badge variant="outline" className="gap-1 bg-secondary/50 backdrop-blur-sm border-border/50">
                  <Clock className="w-3 h-3" />
                  {anime.status}
                </Badge>
              )}
              {anime.source && (
                <Badge variant="outline" className="gap-1 bg-secondary/50 backdrop-blur-sm border-border/50">
                  <BookOpen className="w-3 h-3" />
                  {anime.source}
                </Badge>
              )}
              {anime.aired?.string && (
                <Badge variant="outline" className="gap-1 bg-secondary/50 backdrop-blur-sm border-border/50">
                  <Calendar className="w-3 h-3" />
                  {anime.aired.string}
                </Badge>
              )}
              {anime.duration && (
                <Badge variant="outline" className="bg-secondary/50 backdrop-blur-sm border-border/50">{anime.duration}</Badge>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {anime.genres.map((genre) => (
                  <Badge key={genre.mal_id} className="bg-primary/20 text-primary hover:bg-primary/30">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {anime.synopsis && (
              <div className="relative rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background/90 to-secondary/15 backdrop-blur-2xl" />
                <div className="absolute inset-0 border border-white/15 rounded-xl" />
                <ScrollArea className="relative h-36 p-4">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Sinopse</h4>
                  <p className="text-sm text-foreground leading-relaxed pr-4">
                    {anime.synopsis}
                  </p>
                </ScrollArea>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
              {onViewFullDetails && (
                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90 btn-press"
                  onClick={() => {
                    onClose()
                    onViewFullDetails(anime.mal_id)
                  }}
                >
                  <Play className="w-4 h-4" />
                  Ver Trailers, Galeria e Mais
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full gap-2 glass-card border-border/40 hover:border-primary/50 btn-press"
                onClick={() => window.open(`https://myanimelist.net/anime/${anime.mal_id}`, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                Ver no MyAnimeList
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
