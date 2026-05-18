"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"
import type { KillStreak } from "@/lib/types"

const STREAK_CONFIG = {
  double: { label: "DOUBLE KILL", color: "#00ff88", sound: "double" },
  triple: { label: "TRIPLE KILL", color: "#00ccff", sound: "triple" },
  quad: { label: "QUAD KILL", color: "#ff8800", sound: "quad" },
  rampage: { label: "RAMPAGE!", color: "#ff4444", sound: "rampage" },
  godlike: { label: "GODLIKE!", color: "#ffd700", sound: "godlike" },
}

interface KillStreakOverlayProps {
  className?: string
}

export function KillStreakOverlay({ className }: KillStreakOverlayProps) {
  const [streak, setStreak] = useState<KillStreak | null>(null)
  const [flames, setFlames] = useState<number[]>([])

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsub = sync.subscribe("KILL_STREAK" as SyncEventType, (payload) => {
      const killStreak = payload as KillStreak
      setStreak(killStreak)
      setFlames(Array.from({ length: 20 }, (_, i) => i))

      setTimeout(() => {
        setStreak(null)
        setFlames([])
      }, 3000)
    })

    return () => unsub()
  }, [])

  if (!streak) return null

  const config = STREAK_CONFIG[streak.type]

  return (
    <div className={cn("fixed inset-0 pointer-events-none flex items-center justify-center z-50", className)}>
      {/* Background flash */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{
          background: `radial-gradient(circle at center, ${config.color}20 0%, transparent 70%)`,
        }}
      />

      {/* Fire particles */}
      <div className="absolute inset-0 overflow-hidden">
        {flames.map((i) => (
          <div
            key={i}
            className="absolute animate-fire-particle"
            style={{
              left: `${30 + Math.random() * 40}%`,
              bottom: 0,
              width: 8 + Math.random() * 12,
              height: 20 + Math.random() * 40,
              background: `linear-gradient(to top, ${config.color}, transparent)`,
              borderRadius: "50%",
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${0.8 + Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main streak announcement */}
      <div className="relative">
        {/* Glow background */}
        <div className="absolute inset-0 blur-3xl opacity-50 animate-pulse" style={{ backgroundColor: config.color }} />

        {/* Main text */}
        <div className="relative animate-streak-slam">
          <div
            className={cn("text-6xl font-black uppercase tracking-wider text-center animate-streak-glow")}
            style={{
              color: config.color,
              textShadow: `0 0 20px ${config.color}, 0 0 40px ${config.color}, 0 0 80px ${config.color}`,
            }}
          >
            {config.label}
          </div>

          {/* Player info */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div
              className="px-3 py-1 rounded text-sm font-bold uppercase"
              style={{
                backgroundColor: `${streak.teamColor}30`,
                color: streak.teamColor,
                border: `2px solid ${streak.teamColor}`,
              }}
            >
              {streak.teamShortName}
            </div>
            <div className="text-2xl font-bold text-white">{streak.playerName}</div>
            <div className="flex items-center gap-1 text-white">
              <span className="text-3xl font-black" style={{ color: config.color }}>
                {streak.count}
              </span>
              <span className="text-sm opacity-70">KILLS</span>
            </div>
          </div>
        </div>

        {/* Decorative lines */}
        <div
          className="absolute left-0 top-1/2 w-32 h-0.5 -translate-y-1/2 -translate-x-full"
          style={{ background: `linear-gradient(to left, ${config.color}, transparent)` }}
        />
        <div
          className="absolute right-0 top-1/2 w-32 h-0.5 -translate-y-1/2 translate-x-full"
          style={{ background: `linear-gradient(to right, ${config.color}, transparent)` }}
        />
      </div>
    </div>
  )
}
