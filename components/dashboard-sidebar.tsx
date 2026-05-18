"use client"

import { cn } from "@/lib/utils"
import { 
  Flame, 
  Sparkles, 
  CalendarDays, 
  Search, 
  Heart,
  Palette,
  ChevronLeft,
  ChevronRight,
  User,
  Link
} from "lucide-react"
import type { AnimeCategory, UserProfile } from "@/lib/jikan"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { UserProfileCard } from "@/components/user-profile-card"

interface DashboardSidebarProps {
  activeCategory: AnimeCategory
  onCategoryChange: (category: AnimeCategory) => void
  onSearchClick: () => void
  userProfile: UserProfile | null
  onConnectClick: () => void
  onDisconnect: () => void
  onThemeClick: () => void
}

const menuItems = [
  { id: "top" as const, label: "Top Animes", icon: Flame, description: "Os mais bem avaliados" },
  { id: "seasonal" as const, label: "Temporada", icon: Sparkles, description: "Animes da temporada atual" },
  { id: "upcoming" as const, label: "Em Breve", icon: CalendarDays, description: "Próximos lançamentos" },
]

const bottomMenuItems = [
  { id: "theme", label: "Tema", icon: Palette },
]

export function DashboardSidebar({ 
  activeCategory, 
  onCategoryChange, 
  onSearchClick,
  userProfile,
  onConnectClick,
  onDisconnect,
  onThemeClick
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside 
      className={cn(
        "glass-sidebar h-screen sticky top-0 flex flex-col transition-[width] duration-150 ease-out",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/30 backdrop-blur-sm flex items-center justify-center shrink-0 border border-primary/20 shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-200">
            <Flame className="w-5 h-5 text-primary animate-pulse" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg text-sidebar-foreground">AniTracker</h1>
              <p className="text-xs text-muted-foreground">Sua lista de animes</p>
            </div>
          )}
        </div>
      </div>

      {/* User Profile / Connect Button */}
      {!collapsed && (
        <div className="p-4 border-b border-sidebar-border/40">
          {userProfile ? (
            <UserProfileCard profile={userProfile} onDisconnect={onDisconnect} />
          ) : (
          <Button 
            onClick={onConnectClick}
            variant="outline"
            className="w-full glass-card justify-start gap-3 text-muted-foreground hover:text-foreground hover:border-primary/50"
          >
              <Link className="w-4 h-4 shrink-0" />
              Conectar MyAnimeList
            </Button>
          )}
        </div>
      )}

      {collapsed && (
        <div className="p-3 border-b border-sidebar-border/40">
          <Button 
            onClick={userProfile ? () => onCategoryChange("mylist") : onConnectClick}
            variant="ghost"
            size="icon"
            className="w-full"
            title={userProfile ? "Minha Lista" : "Conectar MAL"}
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Search Button */}
      <div className={cn("p-4", collapsed ? "px-3" : "px-4")}>
        <Button 
          onClick={onSearchClick}
          variant="outline" 
          className={cn(
            "w-full glass-card justify-start gap-3 text-muted-foreground hover:text-foreground hover:border-primary/50",
            collapsed && "justify-center px-0"
          )}
        >
          <Search className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Buscar animes...</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {/* My List Section (when connected) */}
        {userProfile && (
          <>
            <div className={cn("mb-2", !collapsed && "px-3")}>
              {!collapsed && (
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Minha Conta
                </span>
              )}
            </div>
            <ul className="space-y-1 mb-4">
              <li>
                <button
                  onClick={() => onCategoryChange("mylist")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-100",
                    "hover:bg-sidebar-accent/80",
                    activeCategory === "mylist" 
                      ? "bg-sidebar-accent/90 text-sidebar-primary border border-primary/20" 
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <User className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    activeCategory === "mylist" && "text-primary"
                  )} />
                  {!collapsed && (
                    <div className="text-left">
                      <span className="text-sm font-medium block">Minha Lista</span>
                      <span className="text-xs text-muted-foreground">Seus animes salvos</span>
                    </div>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategoryChange("favorites")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-100",
                    "hover:bg-sidebar-accent/80",
                    activeCategory === "favorites" 
                      ? "bg-sidebar-accent/90 text-sidebar-primary border border-primary/20" 
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Heart className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    activeCategory === "favorites" && "text-red-500"
                  )} />
                  {!collapsed && (
                    <div className="text-left">
                      <span className="text-sm font-medium block">Favoritos</span>
                      <span className="text-xs text-muted-foreground">Seus animes favoritos</span>
                    </div>
                  )}
                </button>
              </li>
            </ul>
          </>
        )}

        <div className={cn("mb-2", !collapsed && "px-3")}>
          {!collapsed && (
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Descobrir
            </span>
          )}
        </div>
        
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onCategoryChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-100",
                  "hover:bg-sidebar-accent/80",
                  activeCategory === item.id 
                    ? "bg-sidebar-accent/90 text-sidebar-primary border border-primary/20" 
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  activeCategory === item.id && "text-primary"
                )} />
                {!collapsed && (
                  <div className="text-left">
                    <span className="text-sm font-medium block">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border/40">
        <ul className="space-y-1">
          {bottomMenuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={item.id === "theme" ? onThemeClick : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-100",
                  "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border/40">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg",
            "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
