"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getRealtimeSync } from "@/lib/realtime"
import Lottie from "lottie-react"

type KillEvent = {
  actor_name: string
  target_name: string
  weapon?: string
  is_knock?: boolean
}

type TeamWipePayload = {
  team_id?: string
  team_name?: string
  team_rank?: number
  events?: KillEvent[]
}

export function TeamWipeOverlay() {
  const [visible, setVisible] = useState(false)
  const [payload, setPayload] = useState<TeamWipePayload | null>(null)
  const [recent, setRecent] = useState<KillEvent[]>([])

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsubWipe = sync.subscribe("TEAM_WIPE", (p) => {
      const data = p as TeamWipePayload
      setPayload(data)
      setVisible(true)
      setRecent(data.events || [])
      // Hide after 6s
      setTimeout(() => setVisible(false), 6000)
    })

    const unsubKill = sync.subscribe("KILL_EVENT", (p) => {
      const e = p as KillEvent
      setRecent((s) => [e, ...s].slice(0, 6))
    })

    return () => {
      unsubWipe()
      unsubKill()
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && payload && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="pointer-events-none fixed left-1/2 -translate-x-1/2 top-20 w-[720px] max-w-[95%] z-50"
        >
          <div className="bg-gradient-to-r from-black/70 via-transparent to-black/70 rounded-2xl p-4 shadow-xl ring-1 ring-white/5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-gold to-orange rounded-lg flex items-center justify-center">
                {/* Optional Lottie placeholder - replace animationData prop with asset when available */}
                <div className="text-black font-extrabold">WIPE</div>
              </div>

              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-2xl font-bold uppercase tracking-wider">Team Wipeout</h3>
                  {payload.team_rank !== undefined && (
                    <span className="text-sm text-muted-foreground">Rank {payload.team_rank}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{payload.team_name}</p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recent.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-xs">{r.actor_name?.[0] || "?"}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{r.actor_name}</div>
                        <div className="text-xs text-muted-foreground">{r.is_knock ? "knocked" : "killed"} {r.target_name} {r.weapon ? `with ${r.weapon}` : ""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TeamWipeOverlay
