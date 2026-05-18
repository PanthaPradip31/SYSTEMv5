"use client"

import { useState, useEffect } from "react"
import { useStandings, useTeams } from "@/lib/store"
import { useRealtimeSync } from "@/lib/realtime"
import { cn } from "@/lib/utils"
import { TrophyIcon, SkullIcon } from "@/components/icons"

interface MatchResultsProps {
  matchNumber?: number
  showTop?: number
}

export function MatchResults({ matchNumber = 1, showTop = 16 }: MatchResultsProps) {
  const { standings } = useStandings()
  const { teams } = useTeams()
  const [visible, setVisible] = useState(true)
  const [animatedRanks, setAnimatedRanks] = useState<number[]>([])

  useRealtimeSync()

  // Animate ranks appearing one by one
  useEffect(() => {
    if (visible) {
      const sorted = [...standings].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, showTop)

      sorted.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedRanks((prev) => [...prev, index])
        }, index * 150)
      })
    }
    return () => setAnimatedRanks([])
  }, [visible, standings, showTop])

  const sortedStandings = [...standings].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, showTop)

  return (
    <div className="w-full max-w-4xl mx-auto p-6 obs-overlay">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-gold text-sm font-medium uppercase tracking-widest">Match {matchNumber} Results</p>
        <h1 className="text-4xl font-black uppercase mt-2">Overall Standings</h1>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 gap-3">
        {sortedStandings.map((standing, index) => {
          const team = teams.find((t) => t.id === standing.teamId) || standing.team
          const isAnimated = animatedRanks.includes(index)
          const isTop3 = index < 3

          return (
            <div
              key={standing.teamId}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-500 border",
                isAnimated ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
                isTop3 ? "bg-gold/10 border-gold/30" : "bg-card/80 border-border/50",
              )}
            >
              {/* Rank */}
              <div
                className={cn(
                  "w-10 h-10 rounded flex items-center justify-center font-black text-lg",
                  index === 0 && "bg-gold text-background",
                  index === 1 && "bg-zinc-400 text-background",
                  index === 2 && "bg-amber-700 text-background",
                  index > 2 && "bg-secondary text-foreground",
                )}
              >
                {isTop3 && <TrophyIcon className="w-5 h-5" />}
                {!isTop3 && index + 1}
              </div>

              {/* Team info */}
              <div className="flex items-center gap-2 flex-1">
                <img
                  src={team.logo || "/placeholder.svg?height=32&width=32&query=team logo"}
                  alt={team.name}
                  className="w-8 h-8 rounded"
                />
                <span className="font-bold">{team.shortName}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <SkullIcon className="w-4 h-4" />
                  <span>{standing.totalKills}</span>
                </div>
                <div className="w-16 text-right">
                  <span className="text-xl font-black text-gold">{standing.totalPoints}</span>
                  <span className="text-xs text-muted-foreground ml-1">PTS</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
