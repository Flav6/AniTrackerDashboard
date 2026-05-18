"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Star, Calendar, Users, Trophy, Clock, Tv, BookOpen, ExternalLink, 
  Play, ChevronDown, ChevronUp, X, Mic2, Film, ImageIcon, Quote,
  ArrowLeft, Heart, Share2
} from "lucide-react"
import { 
  fetchAnimeFullById, 
  fetchAnimeVideos, 
  fetchAnimePictures, 
  fetchAnimeCharacters,
  fetchAnimeStaff,
  fetchAnimeRecommendations,
  type AnimeData,
  type AnimeVideo,
  type AnimePicture,
  type AnimeCharacter,
  type AnimeStaff,
  type AnimeRecommendation
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

  // Reset state when anime changes
  useEffect(() => {
    setSelectedVideoId(null)
    setActiveTab("trailer")
    setShowFullSynopsis(false)
  }, [animeId])

  // Fetch anime full details
  const { data: animeData, error: animeError, isLoading: animeLoading } = useSWR(
    `anime-full-${animeId}`,
    () => fetchAnimeFullById(animeId),
    { revalidateOnFocus: false }
  )

  // Fetch videos
  const { data: videosData } = useSWR(
    `anime-videos-${animeId}`,
    () => fetchAnimeVideos(animeId),
    { revalidateOnFocus: false }
  )

  // Fetch pictures
  const { data: picturesData } = useSWR(
    `anime-pictures-${animeId}`,
    () => fetchAnimePictures(animeId),
    { revalidateOnFocus: false }
  )

  // Fetch characters
  const { data: charactersData } = useSWR(
    `anime-characters-${animeId}`,
    () => fetchAnimeCharacters(animeId),
    { revalidateOnFocus: false }
  )

  // Fetch staff
  const { data: staffData } = useSWR(
    `anime-staff-${animeId}`,
    () => fetchAnimeStaff(animeId),
    { revalidateOnFocus: false }
  )

  // Fetch recommendations
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

  // Helper function to extract YouTube ID from embed URL
  function extractYoutubeId(embedUrl: string | null | undefined): string | null {
    if (!embedUrl) return null
    const match = embedUrl.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)/)
    return match ? match[1] : null
  }

  // Get main trailer
  const animeTrailerId = anime?.trailer?.youtube_id || extractYoutubeId(anime?.trailer?.embed_url)
  const promoTrailerId = videos?.promo?.[0]?.trailer?.youtube_id || extractYoutubeId(videos?.promo?.[0]?.trailer?.embed_url)
  const mainTrailerYoutubeId = animeTrailerId || promoTrailerId
  
  // Get all available promos
  const allPromos = (videos?.promo || []).map(promo => ({
    ...promo,
    extractedYoutubeId: promo.trailer.youtube_id || extractYoutubeId(promo.trailer.embed_url)
  })).filter(promo => promo.extractedYoutubeId)
  
  // Current video to display
  const currentVideoId = selectedVideoId || mainTrailerYoutubeId

  // Get staff info
  const director = staff?.find(s => s.positions.some(p => p.toLowerCase().includes("director")))
  const writer = staff?.find(s => s.positions.some(p => p.toLowerCase().includes("script") || p.toLowerCase().includes("original creator")))

  // Get Japanese voice actors
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
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando detalhes...</p>
        </div>
      </div>
    )
  }

  if (animeError || !anime) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar detalhes do anime</p>
          <Button onClick={onClose}>Voltar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-300">
      {/* Background with anime image blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-30"
        style={{ backgroundImage: `url(${anime.images.jpg.large_image_url})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />

      {/* Scrollable Content */}
      <ScrollArea className="relative h-full">
        <div className="min-h-screen pb-12">
          {/* Header Navigation */}
          <div className="sticky top-0 z-20 glass-panel border-b border-border/30">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 glass-card"
                  onClick={() => window.open(`https://myanimelist.net/anime/${anime.mal_id}`, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                  MAL
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="relative">
            {/* Banner Image */}
            <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
              <img
                src={anime.images.jpg.large_image_url}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 text-balance drop-shadow-lg">
                  {anime.title_english || anime.title}
                </h1>
                {anime.title_japanese && anime.title_english && (
                  <p className="text-lg md:text-xl text-muted-foreground mb-4">
                    {anime.title_japanese}
                  </p>
                )}
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm md:text-base text-muted-foreground">
                  {anime.year && <span>{anime.year}</span>}
                  {anime.type && (
                    <>
                      <span className="text-primary">|</span>
                      <span>{anime.type}</span>
                    </>
                  )}
                  {anime.episodes && (
                    <>
                      <span className="text-primary">|</span>
                      <span>{anime.episodes} eps</span>
                    </>
                  )}
                  {anime.duration && (
                    <>
                      <span className="text-primary">|</span>
                      <span>{anime.duration}</span>
                    </>
                  )}
                  {anime.rating && (
                    <>
                      <span className="text-primary">|</span>
                      <span>{anime.rating}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-6 relative z-10">
            <div className="grid lg:grid-cols-[300px_1fr] gap-8">
              {/* Left Column - Poster & Info */}
              <div className="space-y-6">
                {/* Poster Card */}
                <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title}
                    className="w-full aspect-[3/4] object-cover"
                  />
                </div>

                {/* Score Card */}
                {anime.score && (
                  <div className="glass-panel rounded-2xl p-6 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="44"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          className="text-muted/20"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="44"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeDasharray={`${(anime.score / 10) * 276.46} 276.46`}
                          strokeLinecap="round"
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-foreground">{anime.score.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {anime.scored_by ? `${formatNumber(anime.scored_by)} avaliações` : "Nota MAL"}
                    </p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="glass-panel rounded-2xl p-4 space-y-3">
                  {anime.rank && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        Rank
                      </span>
                      <span className="font-semibold">#{anime.rank}</span>
                    </div>
                  )}
                  {anime.popularity && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Popularidade
                      </span>
                      <span className="font-semibold">#{anime.popularity}</span>
                    </div>
                  )}
                  {anime.members && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Membros
                      </span>
                      <span className="font-semibold">{formatNumber(anime.members)}</span>
                    </div>
                  )}
                  {anime.status && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Status
                      </span>
                      <span className="font-semibold">{anime.status}</span>
                    </div>
                  )}
                  {anime.source && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        Fonte
                      </span>
                      <span className="font-semibold">{anime.source}</span>
                    </div>
                  )}
                </div>

                {/* Streaming Links */}
                {anime.streaming && anime.streaming.length > 0 && (
                  <div className="glass-panel rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Onde Assistir</h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.streaming.slice(0, 4).map((stream) => (
                        <Button
                          key={stream.name}
                          variant="outline"
                          size="sm"
                          className="glass-card text-xs"
                          onClick={() => window.open(stream.url, "_blank")}
                        >
                          {stream.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-8">
                {/* Staff & Synopsis Section */}
                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Staff Info */}
                    <div className="md:w-1/3 space-y-4">
                      {director && (
                        <div>
                          <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                            Diretor
                          </p>
                          <p className="font-medium">{director.person.name}</p>
                        </div>
                      )}
                      {writer && (
                        <div>
                          <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                            Roteirista
                          </p>
                          <p className="font-medium">{writer.person.name}</p>
                        </div>
                      )}
                      {anime.studios && anime.studios.length > 0 && (
                        <div>
                          <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                            Estúdio
                          </p>
                          <p className="font-medium">{anime.studios.map(s => s.name).join(", ")}</p>
                        </div>
                      )}
                    </div>

                    {/* Synopsis */}
                    <div className="flex-1">
                      <h3 className="text-xs text-primary font-semibold uppercase tracking-wider mb-3">
                        Sinopse
                      </h3>
                      <div className={cn("relative", !showFullSynopsis && "max-h-32 overflow-hidden")}>
                        <p className="text-foreground/90 leading-relaxed">
                          {anime.synopsis || "Sinopse não disponível."}
                        </p>
                        {!showFullSynopsis && anime.synopsis && anime.synopsis.length > 300 && (
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
                        )}
                      </div>
                      {anime.synopsis && anime.synopsis.length > 300 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                          className="mt-2 gap-1 text-primary"
                        >
                          {showFullSynopsis ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Ver menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Ver mais
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Genres */}
                  {anime.genres && anime.genres.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border/30">
                      <div className="flex flex-wrap gap-2">
                        {anime.genres.map((genre) => (
                          <Badge key={genre.mal_id} variant="secondary" className="glass-card">
                            {genre.name}
                          </Badge>
                        ))}
                        {anime.themes?.map((theme) => (
                          <Badge key={theme.mal_id} variant="outline" className="glass-card">
                            {theme.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Media Tabs */}
                <div className="glass-panel rounded-2xl overflow-hidden">
                  {/* Tab Headers */}
                  <div className="flex border-b border-border/30">
                    <button
                      onClick={() => setActiveTab("trailer")}
                      className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        activeTab === "trailer" 
                          ? "text-primary border-b-2 border-primary bg-primary/5" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Play className="w-4 h-4" />
                      Trailer
                    </button>
                    <button
                      onClick={() => setActiveTab("gallery")}
                      className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        activeTab === "gallery" 
                          ? "text-primary border-b-2 border-primary bg-primary/5" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Galeria
                    </button>
                    <button
                      onClick={() => setActiveTab("characters")}
                      className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        activeTab === "characters" 
                          ? "text-primary border-b-2 border-primary bg-primary/5" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Mic2 className="w-4 h-4" />
                      Personagens
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-4">
                    {/* Trailer Tab */}
                    {activeTab === "trailer" && (
                      <div>
                        {currentVideoId ? (
                          <div className="aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${currentVideoId}?rel=0`}
                              title={`${anime.title} Trailer`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="aspect-video flex items-center justify-center bg-muted/20 rounded-lg">
                            <div className="text-center text-muted-foreground">
                              <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p>Trailer não disponível</p>
                            </div>
                          </div>
                        )}

                        {/* Additional Videos */}
                        {allPromos.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground mb-3">Mais vídeos</p>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                              {allPromos.map((promo, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedVideoId(promo.extractedYoutubeId)}
                                  className={cn(
                                    "relative shrink-0 w-40 aspect-video rounded-lg overflow-hidden group border-2 transition-all",
                                    currentVideoId === promo.extractedYoutubeId 
                                      ? "border-primary" 
                                      : "border-transparent hover:border-primary/50"
                                  )}
                                >
                                  <img
                                    src={`https://img.youtube.com/vi/${promo.extractedYoutubeId}/mqdefault.jpg`}
                                    alt={promo.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-8 h-8 text-white" />
                                  </div>
                                  <p className="absolute bottom-0 left-0 right-0 p-2 text-xs text-white bg-gradient-to-t from-black/80 to-transparent truncate">
                                    {promo.title}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Gallery Tab */}
                    {activeTab === "gallery" && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {pictures && pictures.length > 0 ? (
                          pictures.slice(0, 9).map((pic, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImage(pic.jpg.large_image_url)}
                              className="aspect-[3/4] rounded-lg overflow-hidden group relative"
                            >
                              <img
                                src={pic.jpg.image_url}
                                alt={`${anime.title} - Imagem ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                            </button>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-12 text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhuma imagem disponível</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Characters Tab */}
                    {activeTab === "characters" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {japaneseVAs && japaneseVAs.length > 0 ? (
                          japaneseVAs.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 glass-card rounded-lg p-3">
                              <img
                                src={item.character.images.jpg.image_url}
                                alt={item.character.name}
                                className="w-14 h-14 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.character.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  CV: {item.voiceActor?.person.name}
                                </p>
                              </div>
                              {item.voiceActor && (
                                <img
                                  src={item.voiceActor.person.images.jpg.image_url}
                                  alt={item.voiceActor.person.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-12 text-muted-foreground">
                            <Mic2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum personagem disponível</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {recommendations && recommendations.length > 0 && (
                  <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Recomendações</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {recommendations.slice(0, 10).map((rec) => (
                        <button
                          key={rec.entry.mal_id}
                          onClick={() => onAnimeSelect?.(rec.entry.mal_id)}
                          className="shrink-0 w-32 group"
                        >
                          <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2">
                            <img
                              src={rec.entry.images.jpg.large_image_url}
                              alt={rec.entry.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {rec.entry.title}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={selectedImage}
            alt="Imagem ampliada"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
