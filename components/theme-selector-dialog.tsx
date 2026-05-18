"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { themes, getThemeById, applyTheme, getStoredTheme, setStoredTheme, type Theme } from "@/lib/themes"
import { cn } from "@/lib/utils"
import { Check, Palette } from "lucide-react"

interface ThemeSelectorDialogProps {
  open: boolean
  onClose: () => void
}

export function ThemeSelectorDialog({ open, onClose }: ThemeSelectorDialogProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>("wine")

  useEffect(() => {
    setSelectedTheme(getStoredTheme())
  }, [open])

  const handleSelectTheme = (theme: Theme) => {
    setSelectedTheme(theme.id)
    setStoredTheme(theme.id)
    applyTheme(theme)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="glass-panel border-border/40 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary/30 backdrop-blur-sm flex items-center justify-center border border-primary/20">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            Escolher Tema
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecione uma paleta de cores para personalizar sua experiência.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {themes.map((theme) => {
            const isSelected = selectedTheme === theme.id
            const previewColor = `oklch(0.55 ${theme.colors.saturation} ${theme.colors.hue})`
            const previewBg = `oklch(0.18 0.03 ${theme.colors.hue})`
            
            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200",
                  "glass-card hover:scale-105",
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                {/* Color Preview */}
                <div 
                  className="w-12 h-12 rounded-full relative overflow-hidden border-2 border-white/10 shadow-lg"
                  style={{ background: previewBg }}
                >
                  <div 
                    className="absolute inset-2 rounded-full"
                    style={{ background: previewColor }}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Theme Name */}
                <span className={cn(
                  "text-xs font-medium",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}>
                  {theme.name}
                </span>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
