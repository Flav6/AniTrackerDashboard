export interface Theme {
  name: string
  id: string
  colors: {
    hue: number
    saturation: number
  }
}

export const themes: Theme[] = [
  { name: "Vinho", id: "wine", colors: { hue: 350, saturation: 0.18 } },
  { name: "Oceano", id: "ocean", colors: { hue: 220, saturation: 0.20 } },
  { name: "Esmeralda", id: "emerald", colors: { hue: 160, saturation: 0.18 } },
  { name: "Roxo", id: "purple", colors: { hue: 280, saturation: 0.18 } },
  { name: "Dourado", id: "gold", colors: { hue: 45, saturation: 0.20 } },
  { name: "Rosa", id: "rose", colors: { hue: 330, saturation: 0.16 } },
  { name: "Ciano", id: "cyan", colors: { hue: 190, saturation: 0.18 } },
  { name: "Cinza", id: "slate", colors: { hue: 220, saturation: 0.04 } },
]

export const THEME_STORAGE_KEY = "anitracker_theme"

export function getStoredTheme(): string {
  if (typeof window === "undefined") return "wine"
  return localStorage.getItem(THEME_STORAGE_KEY) || "wine"
}

export function setStoredTheme(themeId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(THEME_STORAGE_KEY, themeId)
}

export function getThemeById(id: string): Theme {
  return themes.find(t => t.id === id) || themes[0]
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  const { hue, saturation } = theme.colors
  
  // Primary colors
  root.style.setProperty("--theme-hue", hue.toString())
  root.style.setProperty("--theme-saturation", saturation.toString())
  
  // Apply CSS custom properties for the theme
  root.style.setProperty("--primary", `oklch(0.55 ${saturation} ${hue})`)
  root.style.setProperty("--primary-foreground", `oklch(0.98 0.01 ${hue})`)
  root.style.setProperty("--accent", `oklch(0.45 ${saturation * 0.85} ${hue})`)
  root.style.setProperty("--accent-foreground", `oklch(0.98 0.01 ${hue})`)
  root.style.setProperty("--ring", `oklch(0.55 ${saturation} ${hue})`)
  
  // Background tones
  root.style.setProperty("--background", `oklch(0.12 0.02 ${hue})`)
  root.style.setProperty("--foreground", `oklch(0.95 0.01 ${hue})`)
  root.style.setProperty("--card", `oklch(0.18 0.03 ${hue} / 0.6)`)
  root.style.setProperty("--card-foreground", `oklch(0.95 0.01 ${hue})`)
  root.style.setProperty("--popover", `oklch(0.16 0.025 ${hue} / 0.8)`)
  root.style.setProperty("--popover-foreground", `oklch(0.95 0.01 ${hue})`)
  root.style.setProperty("--secondary", `oklch(0.25 0.04 ${hue} / 0.5)`)
  root.style.setProperty("--secondary-foreground", `oklch(0.92 0.01 ${hue})`)
  root.style.setProperty("--muted", `oklch(0.22 0.03 ${hue} / 0.4)`)
  root.style.setProperty("--muted-foreground", `oklch(0.70 0.02 ${hue})`)
  root.style.setProperty("--border", `oklch(0.35 0.06 ${hue} / 0.3)`)
  root.style.setProperty("--input", `oklch(0.25 0.04 ${hue} / 0.5)`)
  
  // Sidebar
  root.style.setProperty("--sidebar", `oklch(0.14 0.025 ${hue} / 0.7)`)
  root.style.setProperty("--sidebar-foreground", `oklch(0.95 0.01 ${hue})`)
  root.style.setProperty("--sidebar-primary", `oklch(0.55 ${saturation} ${hue})`)
  root.style.setProperty("--sidebar-primary-foreground", `oklch(0.98 0.01 ${hue})`)
  root.style.setProperty("--sidebar-accent", `oklch(0.30 0.06 ${hue} / 0.5)`)
  root.style.setProperty("--sidebar-accent-foreground", `oklch(0.95 0.01 ${hue})`)
  root.style.setProperty("--sidebar-border", `oklch(0.35 0.06 ${hue} / 0.3)`)
  root.style.setProperty("--sidebar-ring", `oklch(0.55 ${saturation} ${hue})`)
  
  // Charts
  root.style.setProperty("--chart-1", `oklch(0.55 ${saturation} ${hue})`)
  root.style.setProperty("--chart-2", `oklch(0.65 ${saturation * 0.8} ${(hue + 30) % 360})`)
  root.style.setProperty("--chart-3", `oklch(0.50 ${saturation * 0.7} ${(hue - 20 + 360) % 360})`)
  root.style.setProperty("--chart-4", `oklch(0.70 ${saturation * 0.6} ${(hue + 10) % 360})`)
  root.style.setProperty("--chart-5", `oklch(0.45 ${saturation * 0.85} ${(hue - 10 + 360) % 360})`)
}
