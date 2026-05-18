"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"
import type { MVPData } from "@/lib/types"

interface MVPRevealOverlayProps {
  className?: string
}

export function MVPRevealOverlay({ className }: MVPRevealOverlayProps) {
  const [mvp, setMvp] = useState<MVPData | null>(null)
  const [goldParticles, setGoldParticles] = useState<number[]>([])
  const [confetti, setConfetti] = useState<number[]>([])

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsub = sync.subscribe("MVP_REVEAL" as SyncEventType, (payload) => {
      setMvp(payload as MVPData)
      setGoldParticles(Array.from({ length: 30 }, (_, i) => i))
      setConfetti(Array.from({ length: 50 }, (_, i) => i))

      setTimeout(() => {
        setMvp(null)
        setGoldParticles([])
        setConfetti([])
      }, 45000)
    })

    return () => unsub()
  }, [])

  if (!mvp) return null

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none flex items-center justify-center z-50",
        "bg-black/70",
        className,
      )}
    >
      {/* Gold rain particles */}
      {goldParticles.map((i) => (
        <div
          key={`gold-${i}`}
          className="absolute animate-mvp-gold-rain"
          style={{
            left: `${Math.random() * 100}%`,
            top: -50,
            width: 4 + Math.random() * 6,
            height: 12 + Math.random() * 20,
            background: `linear-gradient(to bottom, #ffd700, #ff8c00)`,
            borderRadius: 2,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Confetti */}
      {confetti.map((i) => (
        <div
          key={`confetti-${i}`}
          className="absolute animate-confetti-fall"
          style={{
            left: `${Math.random() * 100}%`,
            top: -20,
            width: 8 + Math.random() * 8,
            height: 8 + Math.random() * 8,
            background: ["#ffd700", "#ff4444", "#00ff88", "#00ccff", "#ff8800"][Math.floor(Math.random() * 5)],
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* MVP Card */}
      <div className="relative animate-mvp-spotlight">
        {/* Spotlight beam */}
        <div
          className="absolute -top-96 left-1/2 -translate-x-1/2 w-64 h-96"
          style={{
            background: `linear-gradient(to bottom, rgba(255, 215, 0, 0.3) 0%, transparent 100%)`,
            clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0% 100%)",
          }}
        />

        {/* Main card */}
        {/* Main card */}
        <div className="relative bg-linear-to-b from-neutral-900/95 via-black/95 to-black/95 rounded-2xl p-8 border-4 border-gold box-glow-gold max-w-2xl w-full">
          {/* MVP Header */}
          <div className="text-center mb-6 border-b border-gold/20 pb-4">
            <div className="text-gold text-sm font-bold uppercase tracking-[0.5em] mb-1">Match</div>
            <div className="text-6xl font-black text-gold animate-mvp-name-reveal text-glow-gold">MVP</div>
          </div>

          {/* Player info and portrait */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left Column: Player Portrait & Team Logo */}
            <div className="relative shrink-0">
              {/* Outer Golden Glow Circle for Photo */}
              <div className="relative w-44 h-44 rounded-full bg-linear-to-b from-gold via-yellow-600 to-black p-1 shadow-[0_0_25px_rgba(255,215,0,0.4)] overflow-visible">
                <div className="w-full h-full rounded-full bg-black/80 overflow-hidden flex items-center justify-center">
                  <img
                    src={mvp.playerPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(mvp.playerName)}`}
                    alt={mvp.playerName}
                    className="w-36 h-36 object-contain scale-110 translate-y-1 transform transition-transform hover:scale-125"
                  />
                </div>
              </div>
              
              {/* Overlapping Team Logo */}
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-black/95 border-3 border-gold overflow-hidden flex items-center justify-center shadow-lg">
                <img
                  src={mvp.teamLogo || "/placeholder.svg?height=50&width=50"}
                  alt={mvp.teamShortName}
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>

            {/* Right Column: Player name and stats */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <div 
                  className="inline-block px-3 py-0.5 rounded text-xs font-black uppercase mb-1 tracking-wider"
                  style={{
                    backgroundColor: mvp.teamColor || '#ffd700',
                    color: "#000",
                  }}
                >
                  {mvp.teamShortName}
                </div>
                <div className="text-4xl font-black text-white tracking-wide animate-mvp-name-reveal text-glow-white">
                  {mvp.playerName}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 bg-black/40 border border-gold/15 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-gold text-glow-gold">{mvp.kills}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Kills</div>
                </div>
                <div className="text-center border-x border-gold/15">
                  <div className="text-4xl font-extrabold text-gold text-glow-gold">{mvp.damage}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Damage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-gold text-glow-gold leading-[2.2rem]">{mvp.survivalTime}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Survived</div>
                </div>
              </div>
            </div>
          </div>

          {/* WWCD Badge */}
          {mvp.isWWCD && (
            <div className="absolute -top-4 -right-4 bg-gold text-black px-4 py-2 rounded-lg font-black text-sm transform rotate-12 animate-pulse shadow-lg">
              WWCD
            </div>
          )}

          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-gold" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-gold" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-gold" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-gold" />
        </div>
      </div>
    </div>
  )
}
