"use client"

import useSWR from "swr"
import { fetchUserAnimeList, fetchAnimeById, type AnimeListStatus, statusLabels, type UserAnimeListEntry, type AnimeData } from "@/lib/jikan"
import { Loader2, Star, Tv, Calendar, AlertCircle, ListX, ExternalLink, RefreshCw, Info, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { AnimeDetailModal } from "@/components/anime-detail-modal"
import { AnimeDetailPage } from "@/components/anime-detail-page"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MyAnimeListGridProps {
  username: string
  userStats?: {
    watching: number
    completed: number
    on_hold: number
    dropped: number
    plan_to_watch: number
    total_entries: number
  }
}

const statusColors: Record<string, string> = {
  watching: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  on_hold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  dropped: "bg-red-500/20 text-red-400 border-red-500/30",
  plan_to_watch: "bg-blue-500/20 text-blue-400 border-blue-500/30",
}

// Helper function to deduplicate anime entries
function deduplicateAnimeList(list: UserAnimeListEntry[]): UserAnimeListEntry[] {
  const seen = new Set<number>()
  return list.filter((item) => {
    if (seen.has(item.entry.mal_id)) {
      return false
    }
    seen.add(item.entry.mal_id)
    return true
  })
}

export function MyAnimeListGrid({ username, userStats }: MyAnimeListGridProps) {
  const [activeStatus, setActiveStatus] = useState<AnimeListStatus>("all")
  const [selectedAnimeData, setSelectedAnimeData] = useState<AnimeData | null>(null)
  const [fullDetailsAnimeId, setFullDetailsAnimeId] = useState<number | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    username ? [`user-animelist`, username, activeStatus] : null,
    () => fetchUserAnimeList(username, activeStatus === "all" ? undefined : activeStatus),
    { 
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      errorRetryCount: 2,
      errorRetryInterval: 1000
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

  const handleCloseModal = () => {
    setSelectedAnimeData(null)
  }

  const filterButtons: AnimeListStatus[] = ["all", "watching", "completed", "on_hold", "dropped", "plan_to_watch"]

  // Use profile stats if available (more accurate), otherwise calculate from loaded data
  const getStatusCount = (status: AnimeListStatus): number => {
    if (userStats) {
      if (status === "all") return userStats.total_entries
      return userStats[status] || 0
    }
    // Fallback to counting loaded data
    if (status === "all") return data?.data?.length || 0
    return data?.data?.filter(item => item.status === status).length || 0
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando sua lista...</p>
      </div>
    )
  }

  if (error) {
    const isPrivateError = error.message?.includes("privada") || error.message?.includes("403")
    
    return (
      <div className="glass-panel flex flex-col items-center justify-center py-20 gap-4 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="space-y-2">
          <p className="text-foreground font-medium">Erro ao carregar lista</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        
        {isPrivateError && (
          <div className="text-left w-full mt-4 p-4 rounded-lg bg-secondary/20 border border-border/30 space-y-3">
            <p className="text-sm text-foreground font-medium">Como tornar sua lista pública:</p>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Acesse seu perfil no MyAnimeList</li>
              <li>{"Vá em Profile > Edit Profile > List Preferences"}</li>
              <li>{"Em 'Who can see your lists?', selecione 'Everyone'"}</li>
              <li>Salve as alterações e tente novamente</li>
            </ol>
            <a 
              href="https://myanimelist.net/editprofile.php?go=listpreferences" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-2"
            >
              Abrir configurações do MAL
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => mutate()}
          className="mt-4 gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  // Deduplicate the anime list to avoid key errors
  const animeList = deduplicateAnimeList(data?.data || [])

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="glass-panel p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>
              Para adicionar, remover ou editar animes na sua lista, use o{" "}
              <a 
                href={`https://myanimelist.net/animelist/${username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                MyAnimeList
              </a>
              . As alterações serão sincronizadas automaticamente.
            </p>
          </div>
          <a 
            href={`https://myanimelist.net/animelist/${username}?status=7`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Plus className="w-4 h-4" />
              Adicionar Anime
            </Button>
          </a>
        </div>

        {/* Status Filter */}
        <div className="glass-panel p-4 flex flex-wrap gap-2">
          {filterButtons.map((status) => {
            const count = getStatusCount(status)
            return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  "border",
                  activeStatus === status 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30" 
                    : "glass-card border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50"
                )}
              >
                {statusLabels[status]}
                <span className="ml-1.5 text-xs opacity-70">
                  ({count})
                </span>
              </button>
            )
          })}
        </div>

        {/* Stats Summary */}
        {animeList.length > 0 && (
          <div className="glass-panel p-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="text-foreground font-medium">{animeList.length}</span> animes
              {activeStatus !== "all" && ` com status "${statusLabels[activeStatus]}"`}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => mutate()}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar
            </Button>
          </div>
        )}

        {/* Anime Grid */}
        {animeList.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center py-20 gap-4 text-center">
            <ListX className="w-12 h-12 text-muted-foreground" />
            <div>
              <p className="text-foreground font-medium">Nenhum anime encontrado</p>
              <p className="text-sm text-muted-foreground">
                {activeStatus === "all" 
                  ? "Sua lista está vazia. Adicione animes no MyAnimeList!"
                  : `Você não tem animes com status "${statusLabels[activeStatus]}"`
                }
              </p>
            </div>
            <a 
              href={`https://myanimelist.net/animelist/${username}?status=7`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Anime no MAL
              </Button>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {animeList.map((item, index) => (
              <AnimeListCard 
                key={`${item.entry.mal_id}-${index}`} 
                item={item} 
                onClick={() => handleAnimeClick(item.entry.mal_id)}
              />
            ))}
          </div>
        )}

        {/* Quick Preview Modal */}
        <AnimeDetailModal 
          anime={selectedAnimeData} 
          open={!!selectedAnimeData} 
          onClose={handleCloseModal}
          onViewFullDetails={(animeId) => {
            setSelectedAnimeData(null)
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
    </TooltipProvider>
  )
}

function AnimeListCard({ item, onClick }: { item: UserAnimeListEntry; onClick: () => void }) {
  const { entry, score, status, episodes_watched } = item
  const totalEpisodes = entry.episodes || 0
  const progress = totalEpisodes > 0 ? (episodes_watched / totalEpisodes) * 100 : 0

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          onClick={onClick}
          className="glass-card rounded-xl overflow-hidden group hover:shadow-[0_8px_30px_oklch(0.35_0.12_var(--theme-hue,350)_/_0.3)] transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:border-primary/30"
        >
          <div className="flex gap-3 p-3">
            {/* Image */}
            <div className="relative w-20 h-28 rounded-lg overflow-hidden shrink-0">
              <img
                src={entry.images.jpg.image_url}
                alt={entry.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {score > 0 && (
                <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-bold">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  {score}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight mb-1.5 group-hover:text-primary transition-colors">
                  {entry.title}
                </h4>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge 
                    variant="outline" 
                    className={cn("text-[10px] px-1.5 py-0", statusColors[status])}
                  >
                    {statusLabels[status as keyof typeof statusLabels]}
                  </Badge>
                  {entry.type && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      <Tv className="w-2.5 h-2.5 mr-0.5" />
                      {entry.type}
                    </Badge>
                  )}
                  {entry.year && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      <Calendar className="w-2.5 h-2.5 mr-0.5" />
                      {entry.year}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span className="font-medium text-foreground">
                    {episodes_watched}{totalEpisodes > 0 ? `/${totalEpisodes}` : ""} eps
                  </span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs glass-panel border-border/40">
        <p className="font-medium text-foreground mb-1">{entry.title}</p>
        <p className="text-xs text-muted-foreground">Clique para ver detalhes e sinopse</p>
      </TooltipContent>
    </Tooltip>
  )
}
