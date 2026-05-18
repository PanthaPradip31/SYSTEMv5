"use client"

import { useEffect, useMemo, useRef } from "react"
import { cn, isValidImage } from "@/lib/utils"
import { useTeams, useStandings, calculateStandings } from "@/lib/store"
import type { TeamStanding } from "@/lib/types"
import { TrophyIcon, SkullIcon, ChevronUpIcon, ChevronDownIcon } from "@/components/icons"

interface LiveRankingsProps {
  showTop?: number
  variant?: "full" | "compact" | "minimal"
  className?: string
}

export function LiveRankings({ showTop = 16, variant = "full", className }: LiveRankingsProps) {
  const { teams } = useTeams()
  const { standings } = useStandings()

  // 1. Calculate current standings dynamically on every render (stable & optimized)
  const displayStandings = useMemo(() => {
    return calculateStandings(teams, standings).slice(0, showTop)
  }, [teams, standings, showTop])

  // 2. Use a ref to store ranks from the previous render pass
  const prevRanksRef = useRef<Record<string, number>>({})

  // 3. Capture the current ranks in a ref after each render finishes
  useEffect(() => {
    const ranks: Record<string, number> = {}
    displayStandings.forEach((s) => {
      ranks[s.teamId] = s.rank
    })
    prevRanksRef.current = ranks
  })

  // 4. Look up previous rank from the ref - completely reactive with zero extra state triggers!
  const getRankChange = (teamId: string, currentRank: number) => {
    const prev = prevRanksRef.current[teamId]
    if (!prev) return 0
    return prev - currentRank
  }

  if (variant === "minimal") {
    return (
      <div className={cn("bg-background/90 backdrop-blur-sm rounded-lg overflow-hidden", className)}>
        <div className="gradient-gold px-4 py-2">
          <h3 className="text-primary-foreground font-bold text-sm uppercase tracking-wider">Overall Standings</h3>
        </div>
        <div className="divide-y divide-border/50">
          {displayStandings.slice(0, 5).map((standing) => (
            <div key={standing.teamId} className="flex items-center gap-3 px-3 py-2">
              <span
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded font-bold text-sm",
                  standing.rank === 1 && "bg-gold text-primary-foreground",
                  standing.rank === 2 && "bg-muted-foreground/50 text-foreground",
                  standing.rank === 3 && "bg-orange-700/50 text-foreground",
                  standing.rank > 3 && "bg-secondary text-secondary-foreground",
                )}
              >
                {standing.rank}
              </span>
              <span className="font-semibold text-sm flex-1">{standing.team.shortName}</span>
              <span className="text-gold font-bold">{standing.totalPoints}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("bg-background/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl", className)}>
        <div className="gradient-gold px-4 py-2 flex items-center justify-between">
          <h3 className="text-primary-foreground font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <TrophyIcon className="w-4 h-4" />
            Standings
          </h3>
          <span className="text-primary-foreground/80 text-xs">Top {showTop}</span>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {displayStandings.map((standing, index) => (
            <div
              key={standing.teamId}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 border-b border-border/30",
                "animate-fade-in",
                index === 0 && "bg-gold/10",
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span
                className={cn(
                  "w-5 h-5 flex items-center justify-center rounded text-xs font-bold",
                  standing.rank <= 3 ? "bg-gold text-primary-foreground" : "bg-secondary text-secondary-foreground",
                )}
              >
                {standing.rank}
              </span>
              <img
                src={isValidImage(standing.team?.logo) ? standing.team.logo! : "/placeholder.svg"}
                alt={standing.team?.name || "Team"}
                className="w-5 h-5 rounded object-cover"
              />
              <span className="font-medium text-sm flex-1 truncate">{standing.team.shortName}</span>
              <span className="text-muted-foreground text-xs w-8 text-right">{standing.totalKills}K</span>
              <span className="text-gold font-bold text-sm w-10 text-right">{standing.totalPoints}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Full variant
  return (
    <div className={cn("bg-background/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl", className)}>
      {/* Header */}
      <div className="gradient-gold px-6 py-3 flex items-center justify-between">
        <h3 className="text-primary-foreground font-bold uppercase tracking-wider flex items-center gap-2">
          <TrophyIcon className="w-5 h-5" />
          Overall Standings
        </h3>
        <div className="flex items-center gap-4 text-primary-foreground/80 text-xs uppercase">
          <span className="w-12 text-center">WWCD</span>
          <span className="w-12 text-center">Kills</span>
          <span className="w-14 text-center">Points</span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-muted-foreground text-xs uppercase">
        <span className="w-8 text-center">#</span>
        <span className="w-8"></span>
        <span className="flex-1">Team</span>
        <span className="w-12 text-center">WWCD</span>
        <span className="w-12 text-center">Kills</span>
        <span className="w-14 text-center">Total</span>
      </div>

      {/* Standings List */}
      <div className="divide-y divide-border/30">
        {displayStandings.map((standing, index) => {
          const rankChange = getRankChange(standing.teamId, standing.rank)

          return (
            <div
              key={standing.teamId}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-secondary/30",
                "animate-slide-in-left",
                standing.rank === 1 && "bg-gold/10 border-l-4 border-gold",
                standing.rank === 2 && "bg-muted/20",
                standing.rank === 3 && "bg-muted/10",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Rank */}
              <div className="w-8 flex items-center justify-center">
                <span
                  className={cn(
                    "w-7 h-7 flex items-center justify-center rounded font-bold",
                    standing.rank === 1 && "bg-gold text-primary-foreground",
                    standing.rank === 2 && "bg-gray-400 text-primary-foreground",
                    standing.rank === 3 && "bg-orange-600 text-primary-foreground",
                    standing.rank > 3 && "bg-secondary text-secondary-foreground",
                  )}
                >
                  {standing.rank}
                </span>
              </div>

              {/* Rank Change Indicator */}
              <div className="w-8 flex items-center justify-center">
                {rankChange > 0 && (
                  <span className="flex items-center text-alive text-xs">
                    <ChevronUpIcon className="w-3 h-3" />
                    {rankChange}
                  </span>
                )}
                {rankChange < 0 && (
                  <span className="flex items-center text-destructive text-xs">
                    <ChevronDownIcon className="w-3 h-3" />
                    {Math.abs(rankChange)}
                  </span>
                )}
              </div>

              {/* Team Info */}
              <div className="flex-1 flex items-center gap-3">
                <img
                  src={isValidImage(standing.team?.logo) ? standing.team.logo! : "/placeholder.svg"}
                  alt={standing.team?.name || "Team"}
                  className="w-8 h-8 rounded-lg object-cover border-2"
                  style={{ borderColor: standing.team?.color || "#666" }}
                />
                <div>
                  <span className="font-bold">{standing.team?.shortName || "UNK"}</span>
                  <span className="text-muted-foreground text-xs ml-2 hidden sm:inline">{standing.team?.name || "Loading..."}</span>
                </div>
              </div>

              {/* Stats */}
              <span className="w-12 text-center font-bold text-gold">
                {standing.wwcd > 0 ? `#${standing.wwcd}` : "-"}
              </span>
              <span className="w-12 text-center text-muted-foreground flex items-center justify-center gap-1">
                <SkullIcon className="w-3 h-3" />
                {standing.totalKills}
              </span>
              <span className="w-14 text-center font-bold text-xl text-gold">{standing.totalPoints}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
