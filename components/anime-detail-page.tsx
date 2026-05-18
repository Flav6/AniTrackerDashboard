"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Star, Calendar, Users, Trophy, Clock, Tv, BookOpen, ExternalLink, 
  Play, ChevronDown, ChevronUp, X, Mic2, Film, ImageIcon,
  ArrowLeft, Heart, Share2
} from "lucide-react"
import { 
  fetchAnimeFullById, 
  fetchAnimeVideos, 
  fetchAnimePictures, 
  fetchAnimeCharacters,
  fetchAnimeStaff,
  fetchAnimeRecommendations,
} from "@/lib/jikan"
import { cn } from "@/lib/utils"

interface AnimeDetailPageProps {
  animeId: number
  onClose: () => void
  onAnimeSelect?: (animeId: number) => void
}

export function AnimeDetailPage({ animeId, onClose, onAnimeSelect }: AnimeDetailPageProps) {
  const [showFullSynopsis, setShowFullSynopsis] = useState(false)
  const [activeTab, setActiveTab] = useState<"trailer" | "gallery" | "characters">("trailer")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)

  useEffect(() => {
    setSelectedVideoId(null)
    setActiveTab("trailer")
    setShowFullSynopsis(false)
  }, [animeId])

  const { data: animeData, error: animeError, isLoading: animeLoading } = useSWR(
    `anime-full-${animeId}`,
    () => fetchAnimeFullById(animeId),
    { revalidateOnFocus: false }
  )

  const { data: videosData } = useSWR(
    `anime-videos-${animeId}`,
    () => fetchAnimeVideos(animeId),
    { revalidateOnFocus: false }
  )

  const { data: picturesData } = useSWR(
    `anime-pictures-${animeId}`,
    () => fetchAnimePictures(animeId),
    { revalidateOnFocus: false }
  )

  const { data: charactersData } = useSWR(
    `anime-characters-${animeId}`,
    () => fetchAnimeCharacters(animeId),
    { revalidateOnFocus: false }
  )

  const { data: staffData } = useSWR(
    `anime-staff-${animeId}`,
    () => fetchAnimeStaff(animeId),
    { revalidateOnFocus: false }
  )

  const { data: recommendationsData } = useSWR(
    `anime-recommendations-${animeId}`,
    () => fetchAnimeRecommendations(animeId),
    { revalidateOnFocus: false }
  )

  const anime = animeData?.data
  const videos = videosData?.data
  const pictures = picturesData?.data
  const characters = charactersData?.data
  const staff = staffData?.data
  const recommendations = recommendationsData?.data

  function extractYoutubeId(embedUrl: string | null | undefined): string | null {
    if (!embedUrl) return null
    const match = embedUrl.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)/)
    return match ? match[1] : null
  }

  const animeTrailerId = anime?.trailer?.youtube_id || extractYoutubeId(anime?.trailer?.embed_url)
  const promoTrailerId = videos?.promo?.[0]?.trailer?.youtube_id || extractYoutubeId(videos?.promo?.[0]?.trailer?.embed_url)
  const mainTrailerYoutubeId = animeTrailerId || promoTrailerId
  
  const allPromos = (videos?.promo || []).map(promo => ({
    ...promo,
    extractedYoutubeId: promo.trailer.youtube_id || extractYoutubeId(promo.trailer.embed_url)
  })).filter(promo => promo.extractedYoutubeId)
  
  const currentVideoId = selectedVideoId || mainTrailerYoutubeId

  const director = staff?.find(s => s.positions.some(p => p.toLowerCase().includes("director")))
  const writer = staff?.find(s => s.positions.some(p => p.toLowerCase().includes("script") || p.toLowerCase().includes("original creator")))

  const japaneseVAs = characters?.slice(0, 8).map(c => ({
    character: c.character,
    voiceActor: c.voice_actors.find(va => va.language === "Japanese")
  })).filter(c => c.voiceActor)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (animeLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (animeError || !anime) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar detalhes</p>
          <Button onClick={onClose} size="sm">Voltar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background">
      {/* Background blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-20"
        style={{ backgroundImage: `url(${anime.images.jpg.large_image_url})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />

      <ScrollArea className="relative h-full">
        <div className="min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/20">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={onClose} className="gap-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1.5 h-8 text-xs ml-1"
                  onClick={() => window.open(`https://myanimelist.net/anime/${anime.mal_id}`, "_blank")}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  MAL
                </Button>
              </div>
            </div>
          </header>

          {/* Hero Banner */}
          <div className="relative h-48 md:h-64 overflow-hidden">
            <img
              src={anime.images.jpg.large_image_url}
              alt={anime.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Sidebar */}
              <aside className="lg:w-56 shrink-0">
                {/* Poster */}
                <div className="w-40 lg:w-full mx-auto lg:mx-0">
                  <div className="rounded-xl overflow-hidden shadow-2xl border border-border/30">
                    <img
                      src={anime.images.jpg.large_image_url}
                      alt={anime.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  </div>
                </div>

                {/* Score */}
                {anime.score && (
                  <div className="mt-4 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/30 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                          strokeDasharray={`${(anime.score / 10) * 175.93} 175.93`}
                          strokeLinecap="round" className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{anime.score.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {anime.scored_by ? `${formatNumber(anime.scored_by)} votos` : "Nota MAL"}
                    </p>
                  </div>
                )}

                {/* Stats - Desktop only */}
                <div className="hidden lg:block mt-4 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/30 space-y-2.5 text-sm">
                  {anime.rank && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rank</span>
                      <span className="font-medium">#{anime.rank}</span>
                    </div>
                  )}
                  {anime.popularity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Popularidade</span>
                      <span className="font-medium">#{anime.popularity}</span>
                    </div>
                  )}
                  {anime.members && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Membros</span>
                      <span className="font-medium">{formatNumber(anime.members)}</span>
                    </div>
                  )}
                  {anime.status && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium text-xs">{anime.status}</span>
                    </div>
                  )}
                  {anime.source && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fonte</span>
                      <span className="font-medium">{anime.source}</span>
                    </div>
                  )}
                </div>

                {/* Streaming */}
                {anime.streaming && anime.streaming.length > 0 && (
                  <div className="hidden lg:block mt-4 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/30">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Onde Assistir</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {anime.streaming.slice(0, 3).map((s) => (
                        <Button key={s.name} variant="outline" size="sm" className="h-7 text-xs px-2"
                          onClick={() => window.open(s.url, "_blank")}>
                          {s.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </aside>

              {/* Main Content */}
              <main className="flex-1 min-w-0 space-y-5 pb-8">
                {/* Title & Meta */}
                <div className="pt-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-balance leading-tight">
                    {anime.title_english || anime.title}
                  </h1>
                  {anime.title_japanese && (
                    <p className="text-sm text-muted-foreground mt-1">{anime.title_japanese}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 text-sm text-muted-foreground">
                    {anime.year && <span>{anime.year}</span>}
                    {anime.type && <><span className="text-primary/50">·</span><span>{anime.type}</span></>}
                    {anime.episodes && <><span className="text-primary/50">·</span><span>{anime.episodes} eps</span></>}
                    {anime.duration && <><span className="text-primary/50">·</span><span>{anime.duration}</span></>}
                  </div>
                  {anime.genres && anime.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {anime.genres.map((g) => (
                        <Badge key={g.mal_id} variant="secondary" className="text-xs">{g.name}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Synopsis */}
                <div className="p-4 rounded-xl bg-card/50 backdrop-blur border border-border/30">
                  <div className="flex gap-4">
                    {/* Staff Info */}
                    <div className="hidden md:block w-48 shrink-0 space-y-3 border-r border-border/30 pr-4">
                      {director && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-primary font-medium">Diretor</p>
                          <p className="text-sm">{director.person.name}</p>
                        </div>
                      )}
                      {writer && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-primary font-medium">Roteiro</p>
                          <p className="text-sm">{writer.person.name}</p>
                        </div>
                      )}
                      {anime.studios && anime.studios.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-primary font-medium">Estúdio</p>
                          <p className="text-sm">{anime.studios[0].name}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Synopsis Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[10px] uppercase tracking-wider text-primary font-medium mb-2">Sinopse</h3>
                      <div className={cn("relative text-sm leading-relaxed text-foreground/80", !showFullSynopsis && "max-h-28 overflow-hidden")}>
                        <p>{anime.synopsis || "Sinopse não disponível."}</p>
                        {!showFullSynopsis && anime.synopsis && anime.synopsis.length > 250 && (
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card/90 to-transparent" />
                        )}
                      </div>
                      {anime.synopsis && anime.synopsis.length > 250 && (
                        <Button variant="ghost" size="sm" onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                          className="mt-1 h-7 text-xs text-primary px-0 hover:bg-transparent">
                          {showFullSynopsis ? "Ver menos" : "Ver mais"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Media Tabs */}
                <div className="rounded-xl bg-card/50 backdrop-blur border border-border/30 overflow-hidden">
                  {/* Tab Navigation */}
                  <div className="flex border-b border-border/30">
                    {[
                      { id: "trailer" as const, label: "Trailer", icon: Play },
                      { id: "gallery" as const, label: "Galeria", icon: ImageIcon },
                      { id: "characters" as const, label: "Personagens", icon: Mic2 },
                    ].map((tab) => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                          activeTab === tab.id 
                            ? "text-primary border-b-2 border-primary -mb-px" 
                            : "text-muted-foreground hover:text-foreground"
                        )}>
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-4">
                    {/* Trailer Tab */}
                    {activeTab === "trailer" && (
                      <div className="space-y-4">
                        {currentVideoId ? (
                          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                            <iframe
                              src={`https://www.youtube.com/embed/${currentVideoId}?rel=0`}
                              title={`${anime.title} Trailer`}
                              className="absolute inset-0 w-full h-full rounded-lg"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="aspect-video flex items-center justify-center bg-muted/10 rounded-lg">
                            <div className="text-center text-muted-foreground">
                              <Film className="w-10 h-10 mx-auto mb-2 opacity-40" />
                              <p className="text-sm">Trailer não disponível</p>
                            </div>
                          </div>
                        )}

                        {allPromos.length > 1 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Mais vídeos</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                              {allPromos.slice(0, 5).map((promo, idx) => (
                                <button key={idx} onClick={() => setSelectedVideoId(promo.extractedYoutubeId)}
                                  className={cn(
                                    "relative aspect-video rounded-md overflow-hidden border-2 transition-all",
                                    currentVideoId === promo.extractedYoutubeId 
                                      ? "border-primary ring-1 ring-primary/50" 
                                      : "border-transparent hover:border-primary/40"
                                  )}>
                                  <img src={`https://img.youtube.com/vi/${promo.extractedYoutubeId}/mqdefault.jpg`}
                                    alt={promo.title} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Play className="w-6 h-6 text-white" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Gallery Tab */}
                    {activeTab === "gallery" && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {pictures && pictures.length > 0 ? (
                          pictures.slice(0, 10).map((pic, idx) => (
                            <button key={idx} onClick={() => setSelectedImage(pic.jpg.large_image_url)}
                              className="aspect-[2/3] rounded-md overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                              <img src={pic.jpg.image_url} alt={`${anime.title} ${idx + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                            </button>
                          ))
                        ) : (
                          <div className="col-span-full py-12 text-center text-muted-foreground">
                            <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Nenhuma imagem disponível</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Characters Tab */}
                    {activeTab === "characters" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {japaneseVAs && japaneseVAs.length > 0 ? (
                          japaneseVAs.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                              <img src={item.character.images.jpg.image_url} alt={item.character.name}
                                className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.character.name}</p>
                                <p className="text-xs text-muted-foreground truncate">CV: {item.voiceActor?.person.name}</p>
                              </div>
                              {item.voiceActor && (
                                <img src={item.voiceActor.person.images.jpg.image_url} alt={item.voiceActor.person.name}
                                  className="w-9 h-9 rounded-full object-cover" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-12 text-center text-muted-foreground">
                            <Mic2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Nenhum personagem disponível</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {recommendations && recommendations.length > 0 && (
                  <div className="p-4 rounded-xl bg-card/50 backdrop-blur border border-border/30">
                    <h3 className="text-sm font-medium mb-3">Recomendações</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                      {recommendations.slice(0, 8).map((rec, idx) => (
                        <button key={`${rec.entry.mal_id}-${idx}`} onClick={() => onAnimeSelect?.(rec.entry.mal_id)}
                          className="shrink-0 w-24 group">
                          <div className="aspect-[2/3] rounded-md overflow-hidden mb-1.5">
                            <img src={rec.entry.images.jpg.image_url} alt={rec.entry.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                            {rec.entry.title}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Image Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}>
          <button onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <img src={selectedImage} alt="Imagem ampliada"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
