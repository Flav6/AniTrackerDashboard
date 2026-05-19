"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import dynamic from "next/dynamic"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnimeGrid } from "@/components/anime-grid"
import { MobileNav } from "@/components/mobile-nav"
import { StatsCard } from "@/components/stats-card"
import { getStoredTheme, getThemeById, applyTheme } from "@/lib/themes"
import type { AnimeCategory, UserProfile } from "@/lib/jikan"
import { Trophy, TrendingUp, Users, Tv } from "lucide-react"

// Lazy load dialogs and secondary components (not needed on initial render)
const SearchDialog = dynamic(() => import("@/components/search-dialog").then(m => ({ default: m.SearchDialog })), { ssr: false })
const ConnectMALDialog = dynamic(() => import("@/components/connect-mal-dialog").then(m => ({ default: m.ConnectMALDialog })), { ssr: false })
const ThemeSelectorDialog = dynamic(() => import("@/components/theme-selector-dialog").then(m => ({ default: m.ThemeSelectorDialog })), { ssr: false })
const MyAnimeListGrid = dynamic(() => import("@/components/my-anime-list-grid").then(m => ({ default: m.MyAnimeListGrid })), { 
  loading: () => <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({length: 8}).map((_, i) => <div key={i} className="h-32 rounded-xl skeleton-pulse" />)}</div>
})
const FavoritesGrid = dynamic(() => import("@/components/favorites-grid").then(m => ({ default: m.FavoritesGrid })), {
  loading: () => <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({length: 8}).map((_, i) => <div key={i} className="aspect-[3/4] rounded-xl skeleton-pulse" />)}</div>
})

const MAL_USER_KEY = "anitracker_mal_user"
const MAL_PROFILE_KEY = "anitracker_mal_profile"

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<AnimeCategory>("top")
  const [searchOpen, setSearchOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [malUsername, setMalUsername] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Load saved theme on mount
  useEffect(() => {
    const savedThemeId = getStoredTheme()
    const theme = getThemeById(savedThemeId)
    applyTheme(theme)
  }, [])

  // Load saved user from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem(MAL_USER_KEY)
    const savedProfile = localStorage.getItem(MAL_PROFILE_KEY)
    
    if (savedUsername && savedProfile) {
      setMalUsername(savedUsername)
      try {
        setUserProfile(JSON.parse(savedProfile))
      } catch {
        // Invalid stored profile, clear it
        localStorage.removeItem(MAL_PROFILE_KEY)
      }
    }
  }, [])

  const handleConnect = (username: string, profile: UserProfile) => {
    setMalUsername(username)
    setUserProfile(profile)
    localStorage.setItem(MAL_USER_KEY, username)
    localStorage.setItem(MAL_PROFILE_KEY, JSON.stringify(profile))
    setActiveCategory("mylist")
  }

  const handleDisconnect = () => {
    setMalUsername(null)
    setUserProfile(null)
    localStorage.removeItem(MAL_USER_KEY)
    localStorage.removeItem(MAL_PROFILE_KEY)
    if (activeCategory === "mylist") {
      setActiveCategory("top")
    }
  }

  const handleCategoryChange = (category: AnimeCategory) => {
    // If trying to access mylist or favorites without being connected, open connect dialog
    if ((category === "mylist" || category === "favorites") && !malUsername) {
      setConnectOpen(true)
      return
    }
    setActiveCategory(category)
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar 
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onSearchClick={() => setSearchOpen(true)}
          userProfile={userProfile}
          onConnectClick={() => setConnectOpen(true)}
          onDisconnect={handleDisconnect}
          onThemeClick={() => setThemeOpen(true)}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNav 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onSearchClick={() => setSearchOpen(true)}
        userProfile={userProfile}
        onConnectClick={() => setConnectOpen(true)}
        onDisconnect={handleDisconnect}
        onThemeClick={() => setThemeOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 lg:p-8 p-4 pt-20 pb-24 lg:pt-8 lg:pb-8">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <DashboardHeader category={activeCategory} username={malUsername || undefined} />

          {/* Show Stats only for discover categories */}
          {activeCategory !== "mylist" && activeCategory !== "favorites" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard 
                title="Animes Exibidos"
                value="25,000+"
                description="No catálogo MAL"
                icon={Tv}
              />
              <StatsCard 
                title="Temporada Atual"
                value="50+"
                description="Animes em exibição"
                icon={TrendingUp}
              />
              <StatsCard 
                title="Membros Ativos"
                value="15M+"
                description="Usuários no MAL"
                icon={Users}
              />
              <StatsCard 
                title="Nota Média Top"
                value="9.0+"
                description="Dos melhores animes"
                icon={Trophy}
              />
            </div>
          )}

          {/* Content Grid */}
          {activeCategory === "mylist" && malUsername ? (
            <MyAnimeListGrid 
              username={malUsername} 
              userStats={userProfile?.statistics?.anime}
            />
          ) : activeCategory === "favorites" && malUsername ? (
            <FavoritesGrid username={malUsername} />
          ) : (
            <AnimeGrid category={activeCategory} />
          )}
        </div>
      </main>

      {/* Dialogs */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ConnectMALDialog 
        open={connectOpen} 
        onClose={() => setConnectOpen(false)}
        onConnect={handleConnect}
      />
      <ThemeSelectorDialog 
        open={themeOpen} 
        onClose={() => setThemeOpen(false)}
      />
    </div>
  )
}
