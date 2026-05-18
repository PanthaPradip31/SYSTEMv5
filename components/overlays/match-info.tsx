"use client"

import { cn } from "@/lib/utils"
import { useTournament, useTeams } from "@/lib/store"
import { MapIcon, UsersIcon, ZoneIcon } from "@/components/icons"

interface MatchInfoProps {
  className?: string
}

export function MatchInfo({ className }: MatchInfoProps) {
  const { tournament } = useTournament()
  const { teams } = useTeams()

  const playersAlive = teams.reduce((sum, team) => sum + team.players.filter((p) => !p.isSub && p.status === "alive").length, 0)

  const teamsAlive = teams.filter((team) => team.players.filter((p) => !p.isSub).some((p) => p.status !== "eliminated")).length

  return (
    <div className={cn("bg-background/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl", className)}>
      {/* Tournament Name */}
      <div className="gradient-gold px-4 py-2">
        <h2 className="text-primary-foreground font-bold text-sm uppercase tracking-wider truncate">
          {tournament?.name || "PUBG Tournament"}
        </h2>
      </div>

      {/* Match Info */}
      <div className="px-4 py-3 space-y-2">
        {/* Map and Round */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-gold" />
            <span className="font-medium">Erangel</span>
          </div>
          <div className="text-muted-foreground">Round 1 / Game 1</div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-alive" />
            <span className="font-bold text-alive">{playersAlive}</span>
            <span className="text-muted-foreground text-xs">Alive</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-secondary flex items-center justify-center text-xs font-bold">
              {teamsAlive}
            </div>
            <span className="text-muted-foreground text-xs">Teams</span>
          </div>

          <div className="flex items-center gap-2">
            <ZoneIcon className="w-4 h-4 text-zone" />
            <span className="font-bold text-zone">Zone 4</span>
          </div>
        </div>
      </div>
    </div>
  )
}
