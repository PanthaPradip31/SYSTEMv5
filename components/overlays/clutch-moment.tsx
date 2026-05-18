"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"
import type { ClutchMoment } from "@/lib/types"

interface ClutchMomentOverlayProps {
  className?: string
}

export function ClutchMomentOverlay({ className }: ClutchMomentOverlayProps) {
  const [clutch, setClutch] = useState<ClutchMoment | null>(null)

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsub = sync.subscribe("CLUTCH_MOMENT" as SyncEventType, (payload) => {
      const clutchMoment = payload as ClutchMoment
      if (clutchMoment.isActive) {
        setClutch(clutchMoment)
      } else {
        setClutch(null)
      }
    })

    return () => unsub()
  }, [])

  if (!clutch) return null

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-40", className)}>
      {/* Vignette effect */}
      <div
        className="absolute inset-0 animate-clutch-vignette"
        style={{
          background: `radial-gradient(ellipse at center, transparent 50%, rgba(255, 0, 0, 0.3) 100%)`,
        }}
      />

      {/* Heartbeat border */}
      <div className="absolute inset-4 border-4 border-red-500/50 rounded-lg animate-clutch-heartbeat" />

      {/* Clutch indicator */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <div className="bg-black/90 backdrop-blur-sm px-8 py-4 rounded-lg border-2 border-red-500 animate-clutch-heartbeat">
          <div className="text-center">
            <div className="text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-1 animate-pulse">
              Clutch Situation
            </div>
            <div className="flex items-center gap-4">
              {/* Player */}
              <div className="flex items-center gap-2">
                <div
                  className="px-2 py-1 rounded text-xs font-bold uppercase"
                  style={{
                    backgroundColor: `${clutch.teamColor}30`,
                    color: clutch.teamColor,
                  }}
                >
                  {clutch.teamShortName}
                </div>
                <span className="text-white font-bold text-lg">{clutch.playerName}</span>
              </div>

              {/* VS */}
              <div className="text-3xl font-black text-red-500 animate-pulse">{clutch.situation}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pulsing red corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-red-500 animate-pulse" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-red-500 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-red-500 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-red-500 animate-pulse" />
    </div>
  )
}
