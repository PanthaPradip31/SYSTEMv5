"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useOverlayConfig } from "@/lib/store"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"
import type { ZonePhase } from "@/lib/types"

interface ZonePhaseOverlayProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  className?: string
}

export function ZonePhaseOverlay({ position = "top-right", className }: ZonePhaseOverlayProps) {
  const { config } = useOverlayConfig()
  const [zone, setZone] = useState<ZonePhase | null>(null)

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsub = sync.subscribe("ZONE_UPDATE" as SyncEventType, (payload) => {
      setZone(payload as ZonePhase)
    })

    return () => unsub()
  }, [])

  // Auto-countdown decrementing by 1 second every second
  useEffect(() => {
    if (!zone || zone.timeRemaining <= 0) return

    const interval = setInterval(() => {
      setZone((prev) => {
        if (!prev || prev.timeRemaining <= 0) {
          clearInterval(interval)
          return prev
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [zone?.phase, zone?.timeRemaining])

  if (!zone || config?.showZonePhase === false) return null

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("fixed pointer-events-none z-30", positionClasses[position], className)}>
      <div
        className={cn(
          "bg-black/80 backdrop-blur-sm rounded-lg overflow-hidden",
          "border-2 transition-all duration-300",
          zone.isFinalCircle
            ? "border-red-500 animate-final-circle-pulse"
            : zone.isClosing
              ? "border-zone animate-zone-pulse"
              : "border-zone/50",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "px-4 py-2 flex items-center justify-between gap-6",
            zone.isFinalCircle ? "bg-red-900/50" : "bg-zone/20",
          )}
        >
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", zone.isClosing ? "bg-red-500 animate-pulse" : "bg-zone")} />
            <span className="text-sm font-bold text-white uppercase tracking-wide">Zone Phase</span>
          </div>
          <div className={cn("text-2xl font-black", zone.isFinalCircle ? "text-red-500" : "text-zone")}>
            {zone.phase}/{zone.totalPhases}
          </div>
        </div>

        {/* Timer */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase">
              {zone.isClosing ? "Zone Closing" : "Next Phase"}
            </span>
            <span
              className={cn(
                "text-xl font-mono font-bold",
                zone.timeRemaining <= 30 ? "text-red-500 animate-pulse" : "text-white",
              )}
            >
              {formatTime(zone.timeRemaining)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-1000", zone.isFinalCircle ? "bg-red-500" : "bg-zone")}
              style={{
                width: `${(zone.timeRemaining / 120) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Final circle warning */}
        {zone.isFinalCircle && (
          <div className="px-4 py-2 bg-red-900/80 text-center">
            <span className="text-red-300 text-xs font-bold uppercase tracking-widest animate-pulse">
              Final Circle - Engage!
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
