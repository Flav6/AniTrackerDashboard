"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, ExternalLink, AlertCircle, CheckCircle2, Info, Shield, Globe } from "lucide-react"
import { fetchUserProfile, type UserProfile } from "@/lib/jikan"

interface ConnectMALDialogProps {
  open: boolean
  onClose: () => void
  onConnect: (username: string, profile: UserProfile) => void
}

export function ConnectMALDialog({ open, onClose, onConnect }: ConnectMALDialogProps) {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedUsername = username.trim()
    
    if (!trimmedUsername) {
      setError("Por favor, digite um nome de usuário.")
      return
    }

    // Basic validation
    if (trimmedUsername.length < 2) {
      setError("O nome de usuário deve ter pelo menos 2 caracteres.")
      return
    }

    if (trimmedUsername.length > 16) {
      setError("O nome de usuário não pode ter mais de 16 caracteres.")
      return
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      setError("O nome de usuário só pode conter letras, números, _ e -")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetchUserProfile(trimmedUsername)
      
      if (!response.data) {
        throw new Error("Dados do perfil não encontrados.")
      }
      
      setSuccess(true)
      
      // Small delay to show success state
      setTimeout(() => {
        onConnect(trimmedUsername, response.data)
        setUsername("")
        setSuccess(false)
        onClose()
      }, 800)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao conectar conta"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setUsername("")
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="glass-panel border-border/40 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary/30 backdrop-blur-sm flex items-center justify-center border border-primary/20">
              <User className="w-4 h-4 text-primary" />
            </div>
            Conectar conta MyAnimeList
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Importe sua lista de animes do MAL para organizar e acompanhar seu progresso.
          </DialogDescription>
        </DialogHeader>

        {/* Requirements Box */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 space-y-3">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Requisitos para conectar
          </p>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <Globe className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
              <span>
                <strong className="text-foreground">Perfil público:</strong> Seu perfil do MAL deve estar configurado como público
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Globe className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
              <span>
                <strong className="text-foreground">Lista pública:</strong> Sua lista de animes deve estar visível para todos
              </span>
            </li>
          </ul>
          <a 
            href="https://myanimelist.net/editprofile.php?go=listpreferences" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            Verificar configurações de privacidade
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mal-username" className="text-foreground">
              Nome de usuário do MAL
            </Label>
            <Input
              id="mal-username"
              placeholder="ex: Xisjado"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(null)
              }}
              disabled={loading || success}
              className="glass-input border-border/40 focus:border-primary focus:ring-primary/20"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              O mesmo nome que aparece na URL do seu perfil: myanimelist.net/profile/<strong>username</strong>
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg glass-card border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p>{error}</p>
                {error.includes("não encontrado") && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    Verifique se o nome está escrito corretamente.
                  </p>
                )}
                {error.includes("privad") && (
                  <a 
                    href="https://myanimelist.net/editprofile.php?go=listpreferences" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    Configurar lista como pública
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg glass-card border border-green-500/30 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Conta conectada com sucesso!
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              type="submit" 
              disabled={loading || success || !username.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Conectado!
                </>
              ) : (
                "Conectar conta"
              )}
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" />
              <span>Ainda não tem conta?</span>
              <span className="flex-1 h-px bg-border" />
            </div>

            <a 
              href="https://myanimelist.net/register.php" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-center text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 p-2 rounded-lg hover:bg-secondary/30"
            >
              Criar conta no MyAnimeList
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
