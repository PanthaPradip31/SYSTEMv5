"use client"

import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"
import type { KillFeedEvent } from "@/lib/types"

interface Particle {
  id: number
  x: number
  y: number
  angle: number
  speed: number
  size: number
  color: string
  delay: number
}

interface EpicEliminationProps {
  className?: string
}

export function EpicElimination({ className }: EpicEliminationProps) {
  const [event, setEvent] = useState<KillFeedEvent | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [showShockwave, setShowShockwave] = useState(false)
  const [showGlitch, setShowGlitch] = useState(false)

  useRealtimeSync()

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = []
    const colors = ["#ff4444", "#ff8800", "#ffcc00", "#ffffff"]

    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50 + (Math.random() - 0.5) * 20,
        angle: Math.random() * 360,
        speed: 2 + Math.random() * 4,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.2,
      })
    }
    return newParticles
  }, [])

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsub = sync.subscribe("ELIMINATION_EPIC" as SyncEventType, (payload) => {
      const killEvent = payload as KillFeedEvent
      if (!killEvent.isKnock) {
        setEvent(killEvent)
        setParticles(generateParticles())
        setShowShockwave(true)
        setShowGlitch(true)

        setTimeout(() => setShowShockwave(false), 800)
        setTimeout(() => setShowGlitch(false), 300)
        setTimeout(() => {
          setEvent(null)
          setParticles([])
        }, 2500)
      }
    })

    return () => unsub()
  }, [generateParticles])

  if (!event) return null

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none flex items-center justify-center z-50",
        showGlitch && "animate-screen-shake",
        className,
      )}
    >
      {/* Shockwave effect */}
      {showShockwave && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-red-500 animate-shockwave" />
          <div
            className="absolute w-32 h-32 rounded-full border-4 border-orange-500 animate-shockwave"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="absolute w-32 h-32 rounded-full border-4 border-yellow-500 animate-shockwave"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      )}

      {/* Particles */}
      <div className="particle-container absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-fire-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}s`,
              transform: `rotate(${particle.angle}deg) translateY(-${particle.speed * 50}px)`,
              boxShadow: `0 0 ${particle.size}px ${particle.color}`,
            }}
          />
        ))}
      </div>

      {/* Main elimination card */}
      <div
        className={cn(
          "relative bg-gradient-to-r from-red-900/90 via-red-800/90 to-red-900/90",
          "backdrop-blur-sm rounded-lg px-8 py-6 animate-streak-slam",
          "border-2 border-red-500 box-glow-red",
        )}
      >
        {/* Glitch overlay */}
        {showGlitch && <div className="absolute inset-0 bg-red-500/20 animate-glitch" />}

        <div className="relative z-10 text-center">
          <div className="text-sm font-bold text-red-300 uppercase tracking-widest mb-1">Eliminated</div>

          <div className="flex items-center gap-4 justify-center">
            {/* Killer */}
            <div className="text-right">
              <div className="text-gold font-black text-2xl animate-glitch-color">{event.killerName}</div>
              <div className="text-xs text-gold/70 uppercase">{event.killerTeam}</div>
            </div>

            {/* Skull icon with explosion */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-explosion opacity-50" />
              <svg className="w-12 h-12 text-red-500 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm4 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-2 5.5c2.21 0 4-1.79 4-4h-8c0 2.21 1.79 4 4 4z" />
              </svg>
            </div>

            {/* Victim */}
            <div className="text-left">
              <div className="text-white/50 font-black text-2xl line-through">{event.victimName}</div>
              <div className="text-xs text-white/30 uppercase">{event.victimTeam}</div>
            </div>
          </div>

          {/* Weapon */}
          <div className="mt-2 text-sm text-red-300/80">
            with <span className="font-bold text-white">{event.weapon}</span>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold" />
      </div>
    </div>
  )
}
