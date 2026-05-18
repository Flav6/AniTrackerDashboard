"use client"

import { cn } from "@/lib/utils"
import { Flame, Sparkles, CalendarDays, Search, Menu, User, Link, Palette, Heart } from "lucide-react"
import type { AnimeCategory, UserProfile } from "@/lib/jikan"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { UserProfileCard } from "@/components/user-profile-card"

interface MobileNavProps {
  activeCategory: AnimeCategory
  onCategoryChange: (category: AnimeCategory) => void
  onSearchClick: () => void
  userProfile: UserProfile | null
  onConnectClick: () => void
  onDisconnect: () => void
  onThemeClick: () => void
}

const menuItems = [
  { id: "top" as const, label: "Top", icon: Flame },
  { id: "seasonal" as const, label: "Temporada", icon: Sparkles },
  { id: "upcoming" as const, label: "Em Breve", icon: CalendarDays },
]

export function MobileNav({ 
  activeCategory, 
  onCategoryChange, 
  onSearchClick,
  userProfile,
  onConnectClick,
  onDisconnect,
  onThemeClick
}: MobileNavProps) {
  const [open, setOpen] = useState(false)

  const handleCategoryChange = (category: AnimeCategory) => {
    onCategoryChange(category)
    setOpen(false)
  }

  return (
    <div className="lg:hidden">
      {/* Top Bar */}
      <div className="glass-sidebar fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/30 backdrop-blur-sm flex items-center justify-center border border-primary/20">
            <Flame className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-foreground">AniTracker</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onSearchClick}>
            <Search className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => { onThemeClick(); setOpen(false); }}>
            <Palette className="w-5 h-5" />
          </Button>
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-sidebar w-80 p-0 overflow-y-auto border-l border-sidebar-border/40">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <div className="p-6 border-b border-sidebar-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/30 backdrop-blur-sm flex items-center justify-center border border-primary/20">
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-sidebar-foreground">AniTracker</h1>
                    <p className="text-xs text-muted-foreground">Sua lista de animes</p>
                  </div>
                </div>
              </div>

              {/* User Profile Section */}
              <div className="p-4 border-b border-sidebar-border/40">
                {userProfile ? (
                  <UserProfileCard profile={userProfile} onDisconnect={onDisconnect} />
                ) : (
                  <Button 
                    onClick={() => {
                      onConnectClick()
                      setOpen(false)
                    }}
                    variant="outline"
                    className="w-full glass-card justify-start gap-3 text-muted-foreground hover:text-foreground hover:border-primary/50"
                  >
                    <Link className="w-4 h-4 shrink-0" />
                    Conectar MyAnimeList
                  </Button>
                )}
              </div>

              <nav className="p-4">
                {/* My List (when connected) */}
                {userProfile && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                      Minha Conta
                    </p>
                    <ul className="space-y-1 mb-4">
                      <li>
                        <button
                          onClick={() => handleCategoryChange("mylist")}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                            "hover:bg-sidebar-accent/80",
                            activeCategory === "mylist" 
                              ? "bg-sidebar-accent/90 text-sidebar-primary border border-primary/20" 
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                          )}
                        >
                          <User className={cn(
                            "w-5 h-5 shrink-0 transition-colors",
                            activeCategory === "mylist" && "text-primary"
                          )} />
                          <span className="text-sm font-medium">Minha Lista</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleCategoryChange("favorites")}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                            "hover:bg-sidebar-accent/80",
                            activeCategory === "favorites" 
                              ? "bg-sidebar-accent/90 text-sidebar-primary border border-primary/20" 
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                          )}
                        >
                          <Heart className={cn(
                            "w-5 h-5 shrink-0 transition-colors",
                            activeCategory === "favorites" && "text-red-500"
                          )} />
                          <span className="text-sm font-medium">Favoritos</span>
                        </button>
                      </li>
                    </ul>
                  </>
                )}

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                  Descobrir
                </p>
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleCategoryChange(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                          "hover:bg-sidebar-accent/80",
                          activeCategory === item.id 
                            ? "bg-sidebar-accent/90 text-sidebar-primary border border-primary/20" 
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5 shrink-0 transition-colors",
                          activeCategory === item.id && "text-primary"
                        )} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="glass-sidebar fixed bottom-0 left-0 right-0 z-50 px-4 py-2">
        <div className="flex items-center justify-around">
          {userProfile && (
            <button
              onClick={() => onCategoryChange("mylist")}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                activeCategory === "mylist" 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">Minha Lista</span>
            </button>
          )}
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onCategoryChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                activeCategory === item.id 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
