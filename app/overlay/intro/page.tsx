"use client"

import { useState, useEffect } from "react"
import { useTeams } from "@/lib/store"
import { useRealtimeSync, getRealtimeSync } from "@/lib/realtime"
import { TeamIntro } from "@/components/overlays/team-intro"
import type { Team } from "@/lib/types"

export default function IntroOverlayPage() {
  const { teams } = useTeams()
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [queue, setQueue] = useState<Team[]>([])

  useRealtimeSync()

  // Listen for intro trigger events
  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsubscribe = sync.subscribe("TEAM_INTRO", (payload: unknown) => {
      const data = payload as { team: Team }
      setCurrentTeam(data.team)
    })

    return unsubscribe
  }, [])

  const handleComplete = () => {
    setCurrentTeam(null)
    if (queue.length > 0) {
      const [next, ...rest] = queue
      setCurrentTeam(next)
      setQueue(rest)
    }
  }

  return (
    <div className="w-screen h-screen obs-overlay">
      <TeamIntro team={currentTeam} onComplete={handleComplete} />
    </div>
  )
}
