"use client"

import { useState, useEffect } from "react"
import { useTeams } from "@/lib/store"
import { useRealtimeSync, getRealtimeSync } from "@/lib/realtime"
import { PlayerSpotlight } from "@/components/overlays/player-spotlight"
import type { Player, Team } from "@/lib/types"

export default function SpotlightOverlayPage() {
  const { teams } = useTeams()
  const [spotlightPlayer, setSpotlightPlayer] = useState<Player | null>(null)
  const [spotlightTeam, setSpotlightTeam] = useState<Team | null>(null)

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsubscribe = sync.subscribe("PLAYER_SPOTLIGHT", (payload: unknown) => {
      const data = payload as { playerId: string }
      const team = teams.find((t) => t.players.some((p) => p.id === data.playerId))
      const player = team?.players.find((p) => p.id === data.playerId)
      if (player && team) {
        setSpotlightPlayer(player)
        setSpotlightTeam(team)
      }
    })

    return unsubscribe
  }, [teams])

  return (
    <div className="w-screen h-screen obs-overlay">
      <PlayerSpotlight
        player={spotlightPlayer}
        team={spotlightTeam}
        onClose={() => {
          setSpotlightPlayer(null)
          setSpotlightTeam(null)
        }}
      />
    </div>
  )
}
