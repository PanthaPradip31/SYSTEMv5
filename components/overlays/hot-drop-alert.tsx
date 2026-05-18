"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"

interface HotDropData {
  location: string
  teamsInvolved: string[]
  intensity: "medium" | "high" | "extreme"
}

interface HotDropAlertOverlayProps {
  className?: string
}

export function HotDropAlertOverlay({ className }: HotDropAlertOverlayProps) {
  const [hotDrop, setHotDrop] = useState<HotDropData | null>(null)
  const [flames, setFlames] = useState<number[]>([])

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsub = sync.subscribe("HOT_DROP" as SyncEventType, (payload) => {
      setHotDrop(payload as HotDropData)
      setFlames(Array.from({ length: 15 }, (_, i) => i))

      setTimeout(() => {
        setHotDrop(null)
        setFlames([])
      }, 5000)
    })

    return () => unsub()
  }, [])

  if (!hotDrop) return null

  const intensityColors = {
    medium: { bg: "from-orange-600 to-orange-800", text: "text-orange-300", border: "border-orange-500" },
    high: { bg: "from-red-600 to-red-800", text: "text-red-300", border: "border-red-500" },
    extreme: { bg: "from-red-700 via-orange-600 to-red-700", text: "text-yellow-300", border: "border-yellow-500" },
  }

  const colors = intensityColors[hotDrop.intensity]

  return (
    <div className={cn("fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-50", className)}>
      <div className={cn("relative animate-slide-in-up", "animate-hot-drop-pulse")}>
        {/* Flame effects */}
        <div className="absolute -bottom-4 left-0 right-0 flex justify-center overflow-visible">
          {flames.map((i) => (
            <div
              key={i}
              className="animate-hot-drop-flame"
              style={{
                position: "absolute",
                left: `${10 + (i / flames.length) * 80}%`,
                bottom: 0,
                width: 10 + Math.random() * 15,
                height: 30 + Math.random() * 40,
                background: `linear-gradient(to top, #ff4400, #ff8800, transparent)`,
                borderRadius: "50% 50% 0 0",
                animationDelay: `${Math.random() * 0.3}s`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        {/* Main alert card */}
        <div className={cn("relative bg-gradient-to-r p-0.5 rounded-xl", colors.bg)}>
          <div className={cn("bg-black/90 backdrop-blur-sm rounded-xl px-8 py-4", "border-2", colors.border)}>
            <div className="flex items-center gap-6">
              {/* Fire icon */}
              <div className="relative">
                <svg
                  className="w-12 h-12 text-orange-500 animate-hot-drop-flame"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 23c-3.31 0-6-2.69-6-6 0-2.97 2.16-5.77 4-7.68V8c0-.55.45-1 1-1s1 .45 1 1v1.32c1.84 1.91 4 4.71 4 7.68 0 3.31-2.69 6-6 6z" />
                  <path d="M12 2C10.07 2 8.5 3.57 8.5 5.5c0 .89.36 1.68.92 2.27L12 10.34l2.58-2.57c.56-.59.92-1.38.92-2.27C15.5 3.57 13.93 2 12 2z" />
                </svg>
                <div className="absolute inset-0 bg-orange-500 rounded-full blur-lg opacity-50 animate-pulse" />
              </div>

              {/* Content */}
              <div>
                <div className={cn("text-xs font-bold uppercase tracking-widest mb-1", colors.text)}>
                  {hotDrop.intensity === "extreme" ? "EXTREME" : hotDrop.intensity === "high" ? "INTENSE" : ""} Hot Drop
                </div>
                <div className="text-2xl font-black text-white">{hotDrop.location}</div>
                <div className="text-sm text-white/70 mt-1">{hotDrop.teamsInvolved.length} teams fighting</div>
              </div>

              {/* Team badges */}
              <div className="flex flex-wrap gap-1 max-w-32">
                {hotDrop.teamsInvolved.slice(0, 4).map((team, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-xs font-bold text-white">
                    {team}
                  </span>
                ))}
                {hotDrop.teamsInvolved.length > 4 && (
                  <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-bold text-white">
                    +{hotDrop.teamsInvolved.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
