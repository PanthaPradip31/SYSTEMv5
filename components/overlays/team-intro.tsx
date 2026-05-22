"use client"

import { useEffect, useState } from "react"
import type { Team } from "@/lib/types"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface TeamIntroProps {
  team: Team | null
  onComplete?: () => void
}

export function TeamIntro({ team, onComplete }: TeamIntroProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (team) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 6000) // Keep visible for 6s total
      return () => clearTimeout(timer)
    }
  }, [team, onComplete])

  if (!team) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none obs-overlay z-40"
        >
          {/* Ambient Background Gradient Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${team.color}25, transparent 50%, ${team.color}15)`,
            }}
          />

          {/* Main Card Wrapper */}
          <motion.div
            initial={{ scale: 0.8, y: 80, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.08, y: -60, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 18,
              mass: 1.05,
            }}
            className="relative flex flex-col items-center gap-8 text-center"
          >
            {/* Team Logo Ring with pulsing gradient */}
            <div className="relative shrink-0">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 blur-3xl opacity-45"
                style={{ backgroundColor: team.color }}
              />
              
              <motion.div
                initial={{ rotate: -45, scale: 0.2 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 15,
                  delay: 0.2,
                }}
                className="relative w-44 h-44 rounded-2xl overflow-hidden shadow-2xl p-1 bg-gradient-to-b from-white/10 to-transparent"
                style={{
                  boxShadow: `0 0 45px -5px ${team.color}80, 0 0 0 3px ${team.color}`,
                }}
              >
                <div className="w-full h-full rounded-[14px] bg-black/90 overflow-hidden flex items-center justify-center border border-white/5">
                  <img
                    src={team.logo || "/placeholder.svg?height=160&width=160&query=esports team logo"}
                    alt={team.name}
                    className="w-36 h-36 object-contain select-none"
                  />
                </div>
              </motion.div>
            </div>

            {/* Team Names */}
            <div className="space-y-1">
              <motion.h1
                initial={{ letterSpacing: "12px", opacity: 0 }}
                animate={{ letterSpacing: "3px", opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                className="text-5xl font-black uppercase text-glow"
                style={{
                  color: team.color || "#ffffff",
                  textShadow: `0 0 25px ${team.color}50`,
                }}
              >
                {team.name}
              </motion.h1>
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150, delay: 0.6 }}
                className="text-xl text-muted-foreground font-semibold uppercase tracking-widest"
              >
                {team.shortName}
              </motion.p>
            </div>

            {/* Players Staggered Cards */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.8,
                  },
                },
              }}
              className="flex gap-4 mt-2 flex-wrap justify-center"
            >
              {team.players.map((player, i) => (
                <motion.div
                  key={`${player.id}-${i}`}
                  variants={{
                    hidden: { y: 35, opacity: 0, scale: 0.9 },
                    show: { y: 0, opacity: 1, scale: 1 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 140,
                    damping: 14,
                  }}
                  className={cn(
                    "bg-neutral-900/90 border border-white/5 backdrop-blur-md px-6 py-3 rounded-2xl",
                    "shadow-[0_10px_25px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-gold/30 transition-colors",
                  )}
                >
                  {/* Subtle team colored accent border */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
                    style={{ backgroundColor: team.color }}
                  />
                  
                  <p className="font-extrabold text-lg text-white select-none group-hover:text-gold transition-colors tracking-wide">
                    {player.name}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-0.5 select-none">
                    ACTIVE ROSTER
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
