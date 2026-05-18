"use client"

import { useEffect, useState } from "react"
import type { Team } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TeamIntroProps {
  team: Team | null
  onComplete?: () => void
}

export function TeamIntro({ team, onComplete }: TeamIntroProps) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit" | "hidden">("hidden")

  useEffect(() => {
    if (team) {
      setPhase("enter")
      const t1 = setTimeout(() => setPhase("show"), 500)
      const t2 = setTimeout(() => setPhase("exit"), 4500)
      const t3 = setTimeout(() => {
        setPhase("hidden")
        onComplete?.()
      }, 5000)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }
  }, [team, onComplete])

  if (!team || phase === "hidden") return null

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none obs-overlay">
      {/* Background overlay */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          phase === "enter" || phase === "show" ? "opacity-80" : "opacity-0",
        )}
        style={{
          background: `linear-gradient(135deg, ${team.color}20, transparent 50%, ${team.color}10)`,
        }}
      />

      {/* Main card */}
      <div
        className={cn(
          "relative flex flex-col items-center gap-6 transition-all duration-500",
          phase === "enter" && "opacity-0 scale-90",
          phase === "show" && "opacity-100 scale-100",
          phase === "exit" && "opacity-0 scale-110",
        )}
      >
        {/* Team logo with glow */}
        <div className="relative">
          <div className="absolute inset-0 blur-3xl opacity-50" style={{ backgroundColor: team.color }} />
          <div
            className="relative w-40 h-40 rounded-xl overflow-hidden ring-4 shadow-2xl"
            style={{ boxShadow: `0 0 0 4px ${team.color}` }}
          >
            <img
              src={team.logo || "/placeholder.svg?height=160&width=160&query=esports team logo"}
              alt={team.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Team name */}
        <div className="text-center">
          <h1 className="text-5xl font-black uppercase tracking-wider" style={{ color: team.color }}>
            {team.name}
          </h1>
          <p className="text-xl text-muted-foreground mt-2">{team.shortName}</p>
        </div>

        {/* Players */}
        <div className="flex gap-4 mt-4">
          {team.players.map((player, i) => (
            <div
              key={player.id}
              className={cn(
                "bg-card/80 backdrop-blur px-4 py-2 rounded-lg border transition-all",
                "border-border hover:border-gold",
              )}
              style={{
                transitionDelay: `${i * 100}ms`,
                opacity: phase === "show" ? 1 : 0,
                transform: phase === "show" ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <p className="font-bold text-lg">{player.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
