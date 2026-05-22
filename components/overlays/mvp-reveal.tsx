"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"
import type { MVPData } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

interface MVPRevealOverlayProps {
  className?: string
}

export function MVPRevealOverlay({ className }: MVPRevealOverlayProps) {
  const [mvp, setMvp] = useState<MVPData | null>(null)

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsub = sync.subscribe("MVP_REVEAL" as SyncEventType, (payload) => {
      setMvp(payload as MVPData)

      setTimeout(() => {
        setMvp(null)
      }, 30000) // Keep visible for 30s
    })

    return () => unsub()
  }, [])

  return (
    <AnimatePresence>
      {mvp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={cn(
            "fixed inset-0 pointer-events-none flex items-center justify-center z-50 bg-black/80",
            className,
          )}
        >
          {/* Gold Rain Particle Effect */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={`gold-${i}`}
              initial={{
                y: -100,
                x: `${Math.random() * 100}vw`,
                opacity: 0,
              }}
              animate={{
                y: "110vh",
                opacity: [0, 0.8, 0.8, 0],
              }}
              transition={{
                duration: 2.5 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
                delay: Math.random() * 3,
              }}
              className="absolute"
              style={{
                width: 3 + Math.random() * 4,
                height: 10 + Math.random() * 15,
                background: `linear-gradient(to bottom, #ffd700, #ff8c00)`,
                borderRadius: 2,
                boxShadow: `0 0 8px #ffd700`,
              }}
            />
          ))}

          {/* Confetti falling */}
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={`confetti-${i}`}
              initial={{
                y: -50,
                x: `${Math.random() * 100}vw`,
                rotate: 0,
                opacity: 0,
              }}
              animate={{
                y: "110vh",
                rotate: 360 + Math.random() * 360,
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
                delay: Math.random() * 4,
              }}
              className="absolute"
              style={{
                width: 8 + Math.random() * 6,
                height: 8 + Math.random() * 6,
                background: ["#ffd700", "#ff4444", "#00ff88", "#00ccff", "#ff8800"][i % 5],
                borderRadius: i % 2 === 0 ? "50%" : "0px",
              }}
            />
          ))}

          {/* Spotlight Beam Sweep */}
          <motion.div
            initial={{ opacity: 0, rotate: -40, scaleX: 0.3 }}
            animate={{
              opacity: [0.15, 0.35, 0.15],
              rotate: [-35, -15, -35],
              scaleX: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute top-[-30%] left-[10%] w-[80%] h-[160%] origin-top pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, rgba(255, 215, 0, 0.25) 0%, transparent 80%)`,
              clipPath: "polygon(48% 0, 52% 0, 100% 100%, 0 100%)",
            }}
          />

          {/* Main MVP Card - 3D Flip Entry */}
          <motion.div
            initial={{
              rotateY: -95,
              opacity: 0,
              scale: 0.8,
              z: -500,
            }}
            animate={{
              rotateY: 0,
              opacity: 1,
              scale: 1,
              z: 0,
            }}
            exit={{
              rotateY: 95,
              opacity: 0,
              scale: 0.8,
              z: -500,
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 16,
              mass: 1.2,
            }}
            style={{ perspective: 1200 }}
            className="relative bg-gradient-to-b from-neutral-900/98 via-black/98 to-black/98 rounded-[2.5rem] p-10 border-4 border-gold box-glow-gold max-w-2xl w-full mx-4 shadow-[0_0_60px_rgba(218,165,32,0.3)]"
          >
            {/* MVP Header Banner */}
            <div className="text-center mb-8 border-b border-gold/15 pb-5 relative">
              <motion.div
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gold text-xs font-black uppercase tracking-[0.5em] mb-1"
              >
                MATCH INFLUENCER
              </motion.div>
              <div className="overflow-hidden flex justify-center py-1">
                <motion.h2
                  initial={{ letterSpacing: "18px", opacity: 0, filter: "blur(8px)" }}
                  animate={{ letterSpacing: "4px", opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                  className="text-6xl font-black text-gold text-glow-gold select-none"
                >
                  MVP
                </motion.h2>
              </div>
            </div>

            {/* Player details columns */}
            <div className="flex flex-col md:flex-row items-center gap-10">
              
              {/* Column 1: Player Portrait */}
              <div className="relative shrink-0">
                {/* Outer glowing portrait frame */}
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 15,
                    delay: 0.8,
                  }}
                  className="relative w-48 h-48 rounded-full bg-gradient-to-b from-gold via-yellow-600 to-black p-1 shadow-[0_0_35px_rgba(255,215,0,0.45)]"
                >
                  <div className="w-full h-full rounded-full bg-black/90 overflow-hidden flex items-center justify-center border border-black relative">
                    <motion.img
                      initial={{ y: 50, scale: 0.8, opacity: 0 }}
                      animate={{ y: 6, scale: 1.15, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 14,
                        delay: 1.1,
                      }}
                      src={mvp.playerPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(mvp.playerName)}`}
                      alt={mvp.playerName}
                      className="w-40 h-40 object-contain origin-bottom select-none"
                    />
                  </div>
                </motion.div>

                {/* Overlapping team logo badge */}
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 160,
                    damping: 12,
                    delay: 1.3,
                  }}
                  className="absolute -bottom-3 -right-3 w-18 h-18 rounded-full bg-neutral-950 border-3 border-gold overflow-hidden flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.6)]"
                >
                  <img
                    src={mvp.teamLogo || "/placeholder.svg?height=60&width=60"}
                    alt={mvp.teamShortName}
                    className="w-14 h-14 object-contain select-none"
                  />
                </motion.div>
              </div>

              {/* Column 2: Name and Stats Card */}
              <div className="flex-1 text-center md:text-left space-y-5 w-full">
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 160, delay: 1 }}
                >
                  <div
                    className="inline-block px-3 py-1 rounded text-xs font-black uppercase mb-1.5 tracking-wider shadow-md shadow-black/25"
                    style={{
                      backgroundColor: mvp.teamColor || "#ffd700",
                      color: "#000",
                    }}
                  >
                    {mvp.teamShortName}
                  </div>
                  <h3 className="text-4.5xl font-black text-white tracking-wide text-glow-white">
                    {mvp.playerName}
                  </h3>
                </motion.div>

                {/* Stats Container Grid */}
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.15,
                        delayChildren: 1.2,
                      },
                    },
                  }}
                  className="grid grid-cols-3 gap-4 bg-black/60 border border-gold/15 p-5 rounded-2.5xl backdrop-blur-md shadow-xl"
                >
                  <motion.div
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      show: { y: 0, opacity: 1 },
                    }}
                    transition={{ type: "spring", stiffness: 150 }}
                    className="text-center"
                  >
                    <div className="text-4xl font-extrabold text-gold text-glow-gold tracking-tight">{mvp.kills}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mt-1">KILLS</div>
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      show: { y: 0, opacity: 1 },
                    }}
                    transition={{ type: "spring", stiffness: 150 }}
                    className="text-center border-x border-gold/15"
                  >
                    <div className="text-4xl font-extrabold text-gold text-glow-gold tracking-tight">{mvp.damage}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mt-1">DAMAGE</div>
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      show: { y: 0, opacity: 1 },
                    }}
                    transition={{ type: "spring", stiffness: 150 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-extrabold text-gold text-glow-gold leading-[2.2rem] tracking-tight">{mvp.survivalTime}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mt-1">SURVIVED</div>
                  </motion.div>
                </motion.div>
              </div>

            </div>

            {/* WWCD Badge Overlay */}
            {mvp.isWWCD && (
              <motion.div
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 12, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 10,
                  delay: 1.6,
                }}
                className="absolute -top-5 -right-5 bg-gradient-to-r from-gold via-yellow-500 to-gold text-black px-5 py-2.5 rounded-2xl font-black text-sm shadow-[0_5px_20px_rgba(255,215,0,0.5)] border border-black/20 tracking-wider"
              >
                WWCD CHAMP
              </motion.div>
            )}

            {/* Decorative Esports Border Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-gold rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-gold rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-gold rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-gold rounded-br-xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
