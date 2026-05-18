"use client"

import { useEffect, useState } from "react"
import type { Player, Team } from "@/lib/types"
import { cn } from "@/lib/utils"
import { SkullIcon } from "@/components/icons"

interface PlayerSpotlightProps {
  player: Player | null
  team: Team | null
  onClose?: () => void
}

export function PlayerSpotlight({ player, team, onClose }: PlayerSpotlightProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (player) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => onClose?.(), 500)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [player, onClose])

  if (!player || !team) return null

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "relative bg-linear-to-r from-background/95 via-background/90 to-transparent",
          "border-l-4 px-8 py-6 min-w-[500px] transition-transform duration-500",
          visible ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ borderColor: team.color }}
      >
        {/* Animated background glow */}
        <div
          className="absolute inset-0 opacity-20 blur-xl"
          style={{ background: `linear-gradient(90deg, ${team.color}, transparent)` }}
        />

        <div className="relative flex items-center gap-6">
          {/* Team logo */}
          <div className="w-20 h-20 rounded-lg overflow-hidden ring-2 shrink-0" style={{ boxShadow: `0 0 0 2px ${team.color}` }}>
            <img
              src={team.logo || "/placeholder.svg?height=80&width=80&query=esports team logo"}
              alt={team.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Player info */}
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{team.shortName}</p>
            <h2 className="text-4xl font-black uppercase tracking-tight" style={{ color: team.color }}>
              {player.name}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <SkullIcon className="w-5 h-5 text-destructive" />
                <span className="text-xl font-bold">{player.kills}</span>
                <span className="text-sm text-muted-foreground">KILLS</span>
              </div>
              {player.damage > 0 && (
                <div className="text-muted-foreground">
                  <span className="font-bold">{player.damage}</span> DMG
                </div>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div
            className={cn(
              "px-4 py-2 rounded font-bold uppercase text-sm",
              player.status === "alive" && "bg-emerald-500/20 text-emerald-400",
              player.status === "knocked" && "bg-amber-500/20 text-amber-400",
              player.status === "eliminated" && "bg-red-500/20 text-red-400",
            )}
          >
            {player.status}
          </div>
        </div>
      </div>
    </div>
  )
}
