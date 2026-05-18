"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Team } from "@/lib/types"
import { TrophyIcon } from "@/components/icons"

interface WWCDBannerProps {
  team: Team | null
  kills: number
  className?: string
  onClose?: () => void
}

export function WWCDBanner({ team, kills, className, onClose }: WWCDBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (team) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [team, onClose])

  if (!team || !isVisible) {
    return null
  }

  return (
    <div className={cn("fixed inset-0 flex items-center justify-center z-50", "animate-fade-in", className)}>
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full animate-pulse" />

        {/* Main Banner */}
        <div className="relative bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-gold/30">
          {/* Header */}
          <div className="gradient-gold px-8 py-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <TrophyIcon className="w-8 h-8 text-primary-foreground" />
              <h2 className="text-2xl md:text-3xl font-black text-primary-foreground uppercase tracking-wider">
                Winner Winner Chicken Dinner!
              </h2>
              <TrophyIcon className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* Team Info */}
          <div className="px-12 py-8 flex flex-col items-center gap-4">
            <img
              src={team.logo || "/placeholder.svg"}
              alt={team.name}
              className="w-24 h-24 rounded-2xl object-cover shadow-lg animate-pulse-glow"
              style={{ borderColor: team.color, borderWidth: "4px" }}
            />

            <div className="text-center">
              <h3 className="text-3xl font-black text-gold uppercase">{team.name}</h3>
              <p className="text-muted-foreground mt-1">{team.shortName}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-4">
              <div className="text-center">
                <div className="text-4xl font-black text-gold">#1</div>
                <div className="text-xs text-muted-foreground uppercase">Placement</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-4xl font-black text-foreground">{kills}</div>
                <div className="text-xs text-muted-foreground uppercase">Total Kills</div>
              </div>
            </div>

            {/* Player Names */}
            <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
              {team.players.map((player) => (
                <span key={player.id} className="px-3 py-1 bg-secondary rounded-full text-sm font-medium">
                  {player.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
