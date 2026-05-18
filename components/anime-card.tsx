"use client"

import { memo } from "react"
import { Star, Calendar, Tv } from "lucide-react"
import type { AnimeData } from "@/lib/jikan"
import { Badge } from "@/components/ui/badge"

interface AnimeCardProps {
  anime: AnimeData
  onClick?: () => void
}

export const AnimeCard = memo(function AnimeCard({ anime, onClick }: AnimeCardProps) {
  return (
    <div
      onClick={onClick}
      className="group glass-card rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:border-primary/40"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
          alt={anime.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Score Badge */}
        {anime.score && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/95 backdrop-blur-md text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/30 transition-transform duration-200 group-hover:scale-110">
            <Star className="w-3.5 h-3.5 fill-current" />
            {anime.score.toFixed(1)}
          </div>
        )}

        {/* Rank Badge */}
        {anime.rank && anime.rank <= 100 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-accent/95 backdrop-blur-md text-accent-foreground text-xs font-bold shadow-lg">
            #{anime.rank}
          </div>
        )}

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 to-transparent pt-12">
          <h3 className="text-foreground font-semibold text-base leading-tight line-clamp-2 mb-2 text-balance drop-shadow-sm">
            {anime.title_english || anime.title}
          </h3>
          
          <div className="flex flex-wrap gap-1.5">
            {anime.type && (
              <Badge variant="secondary" className="text-xs bg-secondary/80 backdrop-blur-md border border-white/10">
                <Tv className="w-3 h-3 mr-1" />
                {anime.type}
              </Badge>
            )}
            {anime.episodes && (
              <Badge variant="secondary" className="text-xs bg-secondary/80 backdrop-blur-md border border-white/10">
                {anime.episodes} eps
              </Badge>
            )}
            {anime.year && (
              <Badge variant="secondary" className="text-xs bg-secondary/80 backdrop-blur-md border border-white/10">
                <Calendar className="w-3 h-3 mr-1" />
                {anime.year}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
