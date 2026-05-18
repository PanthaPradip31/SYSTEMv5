"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"
import type { TeamWipe } from "@/lib/types"

interface TeamWipeOverlayProps {
  className?: string
}

export function TeamWipeOverlay({ className }: TeamWipeOverlayProps) {
  const [wipe, setWipe] = useState<TeamWipe | null>(null)
  const [splatters, setSplatters] = useState<number[]>([])

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsub = sync.subscribe("TEAM_WIPE" as SyncEventType, (payload) => {
      const teamWipe = payload as TeamWipe
      setWipe(teamWipe)
      setSplatters(Array.from({ length: 8 }, (_, i) => i))

      setTimeout(() => {
        setWipe(null)
        setSplatters([])
      }, 4000)
    })

    return () => unsub()
  }, [])

  if (!wipe) return null

  return (
    <div className={cn("fixed inset-0 pointer-events-none flex items-center justify-center z-50", className)}>
      {/* Blood splatters */}
      {splatters.map((i) => (
        <div
          key={i}
          className="absolute animate-blood-splatter"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            width: 50 + Math.random() * 100,
            height: 50 + Math.random() * 100,
            background: `radial-gradient(circle, ${wipe.wipedTeamColor}40 0%, transparent 70%)`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}

      {/* Main card */}
      <div className="relative animate-wipe-pulse">
        {/* Slash effect background */}
        <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-red-900/80 to-transparent animate-wipe-slash" />

        <div className="relative bg-black/80 backdrop-blur-sm px-12 py-8 border-y-4 border-red-500">
          {/* TEAM WIPED header */}
          <div className="text-center mb-4">
            <div className="text-red-500 text-sm font-bold uppercase tracking-[0.3em] mb-1">Team Wiped</div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-red-500" />
              <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-red-500" />
            </div>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-center gap-8">
            {/* Wiped team */}
            <div className="text-center opacity-50 line-through">
              <div className="text-4xl font-black" style={{ color: wipe.wipedTeamColor }}>
                {wipe.wipedTeam}
              </div>
              <div className="text-xs text-red-400 uppercase mt-1">Eliminated</div>
            </div>

            {/* By text */}
            <div className="text-red-500 text-xl font-bold">by</div>

            {/* Wiper team */}
            <div className="text-center">
              <div className="text-4xl font-black text-glow-gold" style={{ color: wipe.wiperTeamColor }}>
                {wipe.wiperTeam}
              </div>
              <div className="text-xs text-gold uppercase mt-1">Victory</div>
            </div>
          </div>

          {/* Crossed swords icon */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
            <div className="bg-red-900 p-3 rounded-full border-2 border-red-500">
              <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.92 5L5 6.92l5.79 5.79L5 18.5 6.5 20l5.79-5.79L18.08 20l1.92-1.92-5.79-5.79L20 6.5 18.5 5l-5.79 5.79L6.92 5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
