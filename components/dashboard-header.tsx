"use client"

import type { AnimeCategory } from "@/lib/jikan"
import { Flame, Sparkles, CalendarDays, User, Heart } from "lucide-react"

interface DashboardHeaderProps {
  category: AnimeCategory
  username?: string
}

const categoryInfo: Record<AnimeCategory, { title: string; description: string; icon: React.ElementType }> = {
  top: {
    title: "Top Animes",
    description: "Os animes mais bem avaliados de todos os tempos no MyAnimeList",
    icon: Flame,
  },
  seasonal: {
    title: "Temporada Atual",
    description: "Animes que estão sendo transmitidos nesta temporada",
    icon: Sparkles,
  },
  upcoming: {
    title: "Em Breve",
    description: "Animes que serão lançados nas próximas temporadas",
    icon: CalendarDays,
  },
  mylist: {
    title: "Minha Lista",
    description: "Seus animes salvos no MyAnimeList",
    icon: User,
  },
  favorites: {
    title: "Favoritos",
    description: "Seus animes favoritos no MyAnimeList",
    icon: Heart,
  },
}

export function DashboardHeader({ category, username }: DashboardHeaderProps) {
  const info = categoryInfo[category]
  const Icon = info.icon

  return (
    <div className="glass-panel p-6 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary/30 backdrop-blur-sm flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/20">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
            {category === "mylist" && username ? `Lista de ${username}` : 
             category === "favorites" && username ? `Favoritos de ${username}` : 
             info.title}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            {category === "mylist" && username 
              ? "Gerencie seus animes assistidos, planejados e favoritos"
              : category === "favorites" && username
              ? "Os animes que você mais ama"
              : info.description
            }
          </p>
        </div>
      </div>
    </div>
  )
}
