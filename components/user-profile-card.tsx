"use client"

import { UserProfile } from "@/lib/jikan"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  LogOut,
  Tv,
  CheckCircle2,
  Clock,
  XCircle,
  ListTodo
} from "lucide-react"

interface UserProfileCardProps {
  profile: UserProfile
  onDisconnect: () => void
}

export function UserProfileCard({ profile, onDisconnect }: UserProfileCardProps) {
  const stats = profile.statistics?.anime

  return (
    <div className="glass-panel p-4 space-y-4">
      {/* User Info */}
      <div className="flex items-center gap-3">
        {profile.images?.jpg?.image_url ? (
          <img 
            src={profile.images.jpg.image_url} 
            alt={profile.username}
            loading="lazy"
            decoding="async"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/50"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{profile.username}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </span>
            )}
            {profile.joined && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(profile.joined).getFullYear()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <div className="glass-card rounded-lg p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Tv className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.watching}</p>
            <p className="text-[10px] text-muted-foreground">Assistindo</p>
          </div>
          <div className="glass-card rounded-lg p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.completed}</p>
            <p className="text-[10px] text-muted-foreground">Completos</p>
          </div>
          <div className="glass-card rounded-lg p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
              <ListTodo className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.plan_to_watch}</p>
            <p className="text-[10px] text-muted-foreground">Planejados</p>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {stats.total_entries} animes
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {stats.episodes_watched} episódios
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {stats.days_watched.toFixed(1)} dias
          </Badge>
          {stats.mean_score > 0 && (
            <Badge variant="secondary" className="text-xs">
              Nota média: {stats.mean_score.toFixed(1)}
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-xs"
          asChild
        >
          <a href={profile.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3 mr-1" />
            Ver no MAL
          </a>
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onDisconnect}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-3 h-3 mr-1" />
          Sair
        </Button>
      </div>
    </div>
  )
}
