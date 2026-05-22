"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"
import { motion, AnimatePresence } from "framer-motion"

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

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsub = sync.subscribe("WWCD_TRIGGER" as SyncEventType, (payload) => {
      setWwcd(payload as WWCDData)

      setTimeout(() => {
        setWwcd(null)
      }, 30000) // Keep visible for 30s
    })

    return () => unsub()
  }, [])

  return (
    <AnimatePresence>
      {wwcd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={cn("fixed inset-0 pointer-events-none z-50 overflow-hidden bg-black/85 flex items-center justify-center", className)}
        >
          {/* Golden Rays Rotator */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 0.6 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute flex items-center justify-center inset-0"
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 40 + i * 2,
                  ease: "linear",
                }}
                className="absolute w-2 h-[800px] bg-gradient-to-t from-gold/45 via-gold/10 to-transparent"
                style={{
                  transform: `rotate(${i * 20}deg)`,
                  transformOrigin: "center center",
                }}
              />
            ))}
          </motion.div>

          {/* Fireworks Particles */}
          {Array.from({ length: 12 }).map((_, idx) => (
            <motion.div
              key={`fw-${idx}`}
              initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1.2, 1],
                opacity: [0, 1, 1, 0],
                x: (Math.random() - 0.5) * 800,
                y: -(200 + Math.random() * 400),
              }}
              transition={{
                duration: 2.5 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: Math.random() * 3,
                ease: "easeOut",
              }}
              className="absolute bottom-0"
              style={{
                left: `${15 + idx * 6}%`,
              }}
            >
              <div
                className="w-4 h-4 rounded-full filter blur-[1px]"
                style={{
                  background: ["#ffd700", "#ff4444", "#00ff88", "#00ccff", "#ff8800", "#ff00ff"][idx % 6],
                  boxShadow: `0 0 35px 8px currentColor`,
                }}
              />
            </motion.div>
          ))}

          {/* Confetti Rain */}
          {Array.from({ length: 60 }).map((_, idx) => {
            const size = 6 + Math.random() * 10
            return (
              <motion.div
                key={`cf-${idx}`}
                initial={{
                  y: -100,
                  x: `${Math.random() * 100}vw`,
                  rotate: 0,
                  opacity: 0,
                }}
                animate={{
                  y: "110vh",
                  rotate: 360 + Math.random() * 720,
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                  delay: Math.random() * 6,
                }}
                className="absolute"
                style={{
                  width: size,
                  height: size,
                  background: ["#ffd700", "#ff4444", "#00ff88", "#00ccff", "#ff8800", "#ff00ff", "#ffffff"][idx % 7],
                  borderRadius: idx % 3 === 0 ? "50%" : idx % 3 === 1 ? "4px" : "0px",
                  boxShadow: `0 0 10px rgba(255, 215, 0, 0.2)`,
                }}
              />
            )
          })}

          {/* Main Celebration Card Deck */}
          <motion.div
            initial={{ scale: 0.75, y: 150, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
              mass: 1.1,
            }}
            className="relative bg-gradient-to-b from-gold via-yellow-600 to-gold p-1 rounded-[2.5rem] shadow-[0_0_80px_rgba(218,165,32,0.4)] z-10 max-w-3xl w-full mx-4"
          >
            <div className="bg-neutral-950/98 rounded-[2.4rem] px-12 py-10 border border-black relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(218,165,32,0.06)_0%,transparent_70%)]" />

              {/* Decorative Esports Corners */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-gold rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-gold rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-gold rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-gold rounded-br-3xl" />

              {/* WWCD Header Logo */}
              <motion.div
                initial={{ scale: 0.2, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 15,
                  delay: 0.3,
                }}
                className="text-center mb-5"
              >
                <div className="inline-block p-4 bg-gold/15 rounded-full border border-gold/30 box-glow-gold">
                  <svg className="w-16 h-16 text-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.5 5A1.5 1.5 0 0 0 7 6.5v.634a.75.75 0 0 1-.45.687l-.33.144a.75.75 0 0 1-.58.014L4.5 7.5a2.5 2.5 0 0 0-.354 4.979l.904.15a.75.75 0 0 1 .54.427L6 14h-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1.793l.853.854a.5.5 0 0 0 .708 0L9.5 16h5l1.146 1.146a.5.5 0 0 0 .708 0l.853-.854H19a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-.5l.41-.944a.75.75 0 0 1 .54-.427l.904-.15A2.5 2.5 0 0 0 19.5 7.5l-1.14.479a.75.75 0 0 1-.58-.014l-.33-.144A.75.75 0 0 1 17 7.134V6.5A1.5 1.5 0 0 0 15.5 5h-7z" />
                  </svg>
                </div>
              </motion.div>

              {/* WWCD Large Text Banner */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                  className="text-gold text-sm font-black uppercase tracking-[0.6em] mb-1"
                >
                  Winner Winner
                </motion.div>
                <div className="overflow-hidden flex justify-center py-2">
                  <motion.h2
                    initial={{ letterSpacing: "15px", filter: "blur(6px)", opacity: 0 }}
                    animate={{ letterSpacing: "4px", filter: "blur(0px)", opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
                    className="text-5xl md:text-6xl font-black text-gold text-glow-gold uppercase animate-streak-glow select-none"
                  >
                    CHICKEN DINNER
                  </motion.h2>
                </div>
              </div>

              {/* Team Info Container */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 border-t border-white/10 pt-8 mt-6">
                
                {/* Team Logo Badge */}
                <motion.div
                  initial={{ rotate: -90, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 140,
                    damping: 16,
                    delay: 0.8,
                  }}
                  className="relative shrink-0"
                >
                  <div
                    className="w-32 h-32 rounded-full bg-black/80 border-4 overflow-hidden flex items-center justify-center shadow-[0_0_35px_rgba(255,255,255,0.05)]"
                    style={{ borderColor: wwcd.teamColor || '#ffd700' }}
                  >
                    <img
                      src={wwcd.teamLogo || "/placeholder.svg?height=100&width=100"}
                      alt={wwcd.teamName}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                </motion.div>

                {/* Team Stats */}
                <div className="text-center md:text-left space-y-4">
                  <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 180, delay: 0.9 }}
                  >
                    <h3 className="text-4xl font-black tracking-wide" style={{ color: wwcd.teamColor || '#ffd700' }}>
                      {wwcd.teamName}
                    </h3>
                    <p className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground mt-0.5">
                      CHAMPION SQUAD ({wwcd.teamShortName})
                    </p>
                  </motion.div>

                  {/* Staggered Stats Tiles */}
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.15,
                          delayChildren: 1.1,
                        },
                      },
                    }}
                    className="flex items-center gap-6 text-white"
                  >
                    <motion.div
                      variants={{
                        hidden: { scale: 0.7, opacity: 0 },
                        show: { scale: 1, opacity: 1 },
                      }}
                      transition={{ type: "spring", stiffness: 150 }}
                      className="bg-black/55 border border-gold/15 px-6 py-2.5 rounded-2xl text-center min-w-28 shadow-lg shadow-black/30"
                    >
                      <div className="text-3xl font-black text-gold text-glow-gold">#1</div>
                      <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">PLACEMENT</div>
                    </motion.div>

                    <motion.div
                      variants={{
                        hidden: { scale: 0.7, opacity: 0 },
                        show: { scale: 1, opacity: 1 },
                      }}
                      transition={{ type: "spring", stiffness: 150 }}
                      className="bg-black/55 border border-gold/15 px-6 py-2.5 rounded-2xl text-center min-w-28 shadow-lg shadow-black/30"
                    >
                      <div className="text-3xl font-black text-gold text-glow-gold">{wwcd.totalKills}</div>
                      <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">SQUAD KILLS</div>
                    </motion.div>

                    <motion.div
                      variants={{
                        hidden: { scale: 0.7, opacity: 0 },
                        show: { scale: 1, opacity: 1 },
                      }}
                      transition={{ type: "spring", stiffness: 150 }}
                      className="bg-black/55 border border-gold/15 px-6 py-2.5 rounded-2xl text-center min-w-28 shadow-lg shadow-black/30"
                    >
                      <div className="text-3xl font-black text-gold text-glow-gold">{wwcd.totalPoints}</div>
                      <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">TOTAL PTS</div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
