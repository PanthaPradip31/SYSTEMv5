"use client"

import { cn } from "@/lib/utils"
import { useTeams } from "@/lib/store"
import type { Player, Team } from "@/lib/types"
import { SkullIcon, TrophyIcon } from "@/components/icons"

interface TopFraggersProps {
  count?: number
  className?: string
}

interface PlayerWithTeam extends Player {
  team: Team
}

export function TopFraggers({ count = 5, className }: TopFraggersProps) {
  const { teams } = useTeams()

  const allPlayers: PlayerWithTeam[] = teams.flatMap((team) => team.players.map((player) => ({ ...player, team })))

  const topPlayers = allPlayers
    .filter((p) => p.kills > 0)
    .sort((a, b) => b.kills - a.kills)
    .slice(0, count)

  if (topPlayers.length === 0) {
    return null
  }

  return (
    <div className={cn("bg-background/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl", className)}>
      <div className="gradient-gold px-4 py-2 flex items-center gap-2">
        <TrophyIcon className="w-4 h-4 text-primary-foreground" />
        <h3 className="text-primary-foreground font-bold text-sm uppercase tracking-wider">Top Fraggers</h3>
      </div>

      <div className="divide-y divide-border/30">
        {topPlayers.map((player, index) => (
          <div
            key={player.id}
            className={cn("flex items-center gap-3 px-4 py-2", "animate-slide-in-left", index === 0 && "bg-gold/10")}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded font-bold text-sm",
                index === 0 && "bg-gold text-primary-foreground",
                index === 1 && "bg-gray-400 text-primary-foreground",
                index === 2 && "bg-orange-600 text-primary-foreground",
                index > 2 && "bg-secondary text-secondary-foreground",
              )}
            >
              {index + 1}
            </span>

            <img
              src={player.team.logo || "/placeholder.svg"}
              alt={player.team.name}
              className="w-6 h-6 rounded object-cover"
            />

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{player.name}</div>
              <div className="text-xs text-muted-foreground">{player.team.shortName}</div>
            </div>

            <div className="flex items-center gap-1">
              <SkullIcon className="w-4 h-4 text-destructive" />
              <span className="font-bold text-lg text-gold">{player.kills}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
