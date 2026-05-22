"use client"

import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"
import type { KillFeedEvent } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
}

interface EpicEliminationProps {
  className?: string
}

export function EpicElimination({ className }: EpicEliminationProps) {
  const [event, setEvent] = useState<KillFeedEvent | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])

  useRealtimeSync()

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = []
    const colors = ["#ff3333", "#ff7700", "#ffcc00", "#ffffff"]

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 3 + Math.random() * 8
      newParticles.push({
        id: i,
        x: 50,
        y: 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
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

        setTimeout(() => {
          setEvent(null)
          setParticles([])
        }, 3200) // Keep visible for 3.2s
      }
    })

    return () => unsub()
  }, [generateParticles])

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: [0, -3, 3, -2, 2, 0],
            y: [0, 2, -2, 1, -1, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.4,
            opacity: { duration: 0.2 },
            x: { type: "tween", duration: 0.15 },
            y: { type: "tween", duration: 0.15 },
          }}
          className={cn(
            "fixed inset-0 pointer-events-none flex items-center justify-center z-50 overflow-hidden",
            className,
          )}
        >
          {/* Shockwaves */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 0.15, 0.3].map((delay, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.1, opacity: 0.9, borderWidth: "12px" }}
                animate={{
                  scale: 4,
                  opacity: 0,
                  borderWidth: "1px",
                }}
                transition={{
                  duration: 0.9,
                  ease: "easeOut",
                  delay: delay,
                }}
                className={cn(
                  "absolute w-44 h-44 rounded-full border-solid",
                  idx === 0 && "border-red-500",
                  idx === 1 && "border-orange-500",
                  idx === 2 && "border-yellow-500",
                )}
              />
            ))}
          </div>

          {/* Particles Explosion */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  x: "50vw",
                  y: "50vh",
                  scale: 1,
                  opacity: 1,
                }}
                animate={{
                  x: `calc(50vw + ${p.vx * 30}px)`,
                  y: `calc(50vh + ${p.vy * 30}px)`,
                  scale: 0.1,
                  opacity: 0,
                }}
                transition={{
                  duration: 1 + Math.random() * 0.8,
                  ease: "easeOut",
                }}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  boxShadow: `0 0 10px ${p.color}`,
                }}
              />
            ))}
          </div>

          {/* Main Elimination card deck */}
          <motion.div
            initial={{ scale: 2.2, rotateX: 25, y: -200, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, y: 0, opacity: 1 }}
            exit={{ scale: 0.7, y: 150, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 18,
              mass: 0.95,
            }}
            style={{ perspective: 1000 }}
            className={cn(
              "relative bg-gradient-to-r from-red-950/95 via-red-900/95 to-red-950/95",
              "backdrop-blur-md rounded-2xl px-12 py-8 border-2 border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.45)] max-w-lg w-full text-center mx-4",
            )}
          >
            {/* Ambient Red Glow Layer */}
            <div className="absolute inset-0 bg-red-500/5 animate-pulse rounded-2xl" />

            {/* Corner Esports Accents */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-gold rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-gold rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-gold rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-gold rounded-br-lg" />

            <div className="relative z-10 space-y-4">
              {/* Header Title */}
              <motion.div
                initial={{ letterSpacing: "12px", opacity: 0 }}
                animate={{ letterSpacing: "5px", opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xs font-black text-red-400 uppercase tracking-[0.4em]"
              >
                EPIC ELIMINATION
              </motion.div>

              {/* Killer and Victim Columns */}
              <div className="flex items-center justify-between gap-4 mt-2">

                {/* Killer (Left) */}
                <motion.div
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 180, delay: 0.4 }}
                  className="text-left w-[42%] truncate"
                >
                  <div className="text-gold font-black text-2xl truncate text-glow-gold tracking-wide select-none">
                    {event.killerName}
                  </div>
                  <div className="text-[10px] text-gold/70 uppercase font-extrabold tracking-widest mt-0.5 truncate">
                    {event.killerTeam}
                  </div>
                </motion.div>

                {/* Center Skull Icon & Flame Burst */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 14,
                    delay: 0.2,
                  }}
                  className="relative shrink-0"
                >
                  <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-25" />
                  <div className="relative z-10 w-16 h-16 rounded-full bg-red-500/15 border-2 border-red-500/40 flex items-center justify-center shadow-lg">
                    <svg className="w-9 h-9 text-red-500 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm4 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-2 5.5c2.21 0 4-1.79 4-4h-8c0 2.21 1.79 4 4 4z" />
                    </svg>
                  </div>
                </motion.div>

                {/* Victim (Right) */}
                <motion.div
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 180, delay: 0.4 }}
                  className="text-right w-[42%] truncate"
                >
                  <div className="text-white/50 font-black text-2xl truncate line-through tracking-wide select-none opacity-60">
                    {event.victimName}
                  </div>
                  <div className="text-[10px] text-white/30 uppercase font-extrabold tracking-widest mt-0.5 truncate">
                    {event.victimTeam}
                  </div>
                </motion.div>
              </div>

              {/* Weapon */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150, delay: 0.6 }}
                className="text-sm text-red-300/80 border-t border-white/5 pt-4"
              >
                WEAPON DETECTED: <span className="font-extrabold text-white uppercase tracking-wider">{event.weapon}</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
