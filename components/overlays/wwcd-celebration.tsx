"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"

interface WWCDData {
  teamId: string
  teamName: string
  teamShortName: string
  teamLogo: string
  teamColor: string
  totalKills: number
  totalPoints: number
}

interface WWCDCelebrationOverlayProps {
  className?: string
}

export function WWCDCelebrationOverlay({ className }: WWCDCelebrationOverlayProps) {
  const [wwcd, setWwcd] = useState<WWCDData | null>(null)
  const [fireworks, setFireworks] = useState<number[]>([])
  const [confetti, setConfetti] = useState<number[]>([])

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsub = sync.subscribe("WWCD_TRIGGER" as SyncEventType, (payload) => {
      setWwcd(payload as WWCDData)
      setFireworks(Array.from({ length: 20 }, (_, i) => i))
      setConfetti(Array.from({ length: 100 }, (_, i) => i))

      setTimeout(() => {
        setWwcd(null)
        setFireworks([])
        setConfetti([])
      }, 45000)
    })

    return () => unsub()
  }, [])

  if (!wwcd) return null

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50 overflow-hidden", "bg-black/80", className)}>
      {/* Fireworks */}
      {fireworks.map((i) => (
        <div
          key={`fw-${i}`}
          className="absolute animate-wwcd-fireworks"
          style={{
            left: `${10 + Math.random() * 80}%`,
            bottom: 0,
            animationDelay: `${Math.random() * 2}s`,
          }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: ["#ffd700", "#ff4444", "#00ff88", "#00ccff", "#ff8800", "#ff00ff"][
                Math.floor(Math.random() * 6)
              ],
              boxShadow: `0 0 20px currentColor`,
            }}
          />
        </div>
      ))}

      {/* Confetti rain */}
      {confetti.map((i) => (
        <div
          key={`cf-${i}`}
          className="absolute animate-confetti-fall"
          style={{
            left: `${Math.random() * 100}%`,
            top: -20,
            width: 10 + Math.random() * 10,
            height: 10 + Math.random() * 10,
            background: ["#ffd700", "#ff4444", "#00ff88", "#00ccff", "#ff8800", "#ff00ff", "#ffffff"][
              Math.floor(Math.random() * 7)
            ],
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Main celebration card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative animate-wwcd-burst">
          {/* Golden rays */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-96 bg-linear-to-t from-gold/50 to-transparent"
                style={{
                  transform: `rotate(${i * 30}deg)`,
                  transformOrigin: "center bottom",
                }}
              />
            ))}
          </div>

          {/* Main card */}
          <div className="relative bg-linear-to-b from-gold via-yellow-600 to-gold p-1 rounded-3xl">
            <div className="bg-black/95 rounded-3xl px-16 py-12">
              {/* Chicken icon */}
              <div className="text-center mb-4">
                <div className="inline-block p-4 bg-gold/20 rounded-full">
                  <svg className="w-20 h-20 text-gold" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.5 5A1.5 1.5 0 0 0 7 6.5v.634a.75.75 0 0 1-.45.687l-.33.144a.75.75 0 0 1-.58.014L4.5 7.5a2.5 2.5 0 0 0-.354 4.979l.904.15a.75.75 0 0 1 .54.427L6 14h-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1.793l.853.854a.5.5 0 0 0 .708 0L9.5 16h5l1.146 1.146a.5.5 0 0 0 .708 0l.853-.854H19a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-.5l.41-.944a.75.75 0 0 1 .54-.427l.904-.15A2.5 2.5 0 0 0 19.5 7.5l-1.14.479a.75.75 0 0 1-.58-.014l-.33-.144A.75.75 0 0 1 17 7.134V6.5A1.5 1.5 0 0 0 15.5 5h-7z" />
                  </svg>
                </div>
              </div>

              {/* WWCD Text */}
              <div className="text-center mb-8">
                <div className="text-gold text-lg font-bold uppercase tracking-[0.5em] mb-2">Winner Winner</div>
                <div className="text-7xl font-black text-gold text-glow-gold animate-streak-glow">CHICKEN DINNER</div>
              </div>

              {/* Team info */}
              <div className="flex items-center justify-center gap-8">
                <div
                  className="w-32 h-32 rounded-full bg-white/10 border-4 overflow-hidden flex items-center justify-center"
                  style={{ borderColor: wwcd.teamColor }}
                >
                  <img
                    src={wwcd.teamLogo || "/placeholder.svg?height=100&width=100"}
                    alt={wwcd.teamName}
                    className="w-28 h-28 object-contain"
                  />
                </div>

                <div className="text-center">
                  <div className="text-5xl font-black mb-2" style={{ color: wwcd.teamColor }}>
                    {wwcd.teamName}
                  </div>
                  <div className="flex items-center justify-center gap-8 text-white">
                    <div className="text-center">
                      <div className="text-4xl font-black text-gold">{wwcd.totalKills}</div>
                      <div className="text-sm text-gold/70 uppercase">Kills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-black text-gold">{wwcd.totalPoints}</div>
                      <div className="text-sm text-gold/70 uppercase">Points</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Corner firework bursts */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-gold rounded-full animate-explosion opacity-50" />
          <div
            className="absolute -top-8 -right-8 w-16 h-16 bg-gold rounded-full animate-explosion opacity-50"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-16 h-16 bg-gold rounded-full animate-explosion opacity-50"
            style={{ animationDelay: "0.4s" }}
          />
          <div
            className="absolute -bottom-8 -right-8 w-16 h-16 bg-gold rounded-full animate-explosion opacity-50"
            style={{ animationDelay: "0.6s" }}
          />
        </div>
      </div>
    </div>
  )
}
