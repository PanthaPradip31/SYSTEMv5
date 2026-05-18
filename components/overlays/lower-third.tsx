"use client"

import { useTeams, useStandings } from "@/lib/store"
import { useRealtimeSync } from "@/lib/realtime"
import { cn } from "@/lib/utils"
import { SkullIcon } from "@/components/icons"

interface LowerThirdProps {
  showTop?: number
}

export function LowerThird({ showTop = 8 }: LowerThirdProps) {
  const { standings } = useStandings()
  const { teams } = useTeams()

  useRealtimeSync()

  const sortedStandings = [...standings].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, showTop)

  return (
    <div className="w-full obs-overlay">
      <div className="bg-gradient-to-r from-background via-background/95 to-background/90 border-t-2 border-gold">
        <div className="flex items-stretch divide-x divide-border/50">
          {/* Title section */}
          <div className="flex items-center px-4 py-2 bg-gold">
            <span className="text-background font-black text-sm uppercase tracking-wider">Standings</span>
          </div>

          {/* Teams scrolling ticker */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center py-2 px-2 gap-4 animate-scroll">
              {sortedStandings.map((standing, index) => {
                const team = teams.find((t) => t.id === standing.teamId) || standing.team
                return (
                  <div key={standing.teamId} className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                        index === 0 && "bg-gold text-background",
                        index === 1 && "bg-zinc-400 text-background",
                        index === 2 && "bg-amber-700 text-background",
                        index > 2 && "bg-secondary",
                      )}
                    >
                      {index + 1}
                    </span>
                    <img
                      src={team.logo || "/placeholder.svg?height=24&width=24&query=team"}
                      alt={team.shortName}
                      className="w-6 h-6 rounded"
                    />
                    <span className="font-bold text-sm">{team.shortName}</span>
                    <span className="text-gold font-bold text-sm">{standing.totalPoints}</span>
                    <div className="flex items-center gap-0.5 text-muted-foreground text-xs">
                      <SkullIcon className="w-3 h-3" />
                      {standing.totalKills}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
