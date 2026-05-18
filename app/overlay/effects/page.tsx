"use client"

import { useState, useEffect } from "react"
import { useTeams } from "@/lib/store"
import { useRealtimeSync, getRealtimeSync } from "@/lib/realtime"
import { MVPRevealOverlay } from "@/components/overlays/mvp-reveal"
import { PlayerSpotlight } from "@/components/overlays/player-spotlight"
import { WWCDCelebrationOverlay } from "@/components/overlays/wwcd-celebration"
import { TeamWipeOverlay } from "@/components/overlays/team-wipe"
import { KillStreakOverlay } from "@/components/overlays/kill-streak"
import { ClutchMomentOverlay } from "@/components/overlays/clutch-moment"
import { ZonePhaseOverlay } from "@/components/overlays/zone-phase"
import { AirdropAlertOverlay } from "@/components/overlays/airdrop-alert"
import { HotDropAlertOverlay } from "@/components/overlays/hot-drop-alert"
import { EpicElimination } from "@/components/overlays/epic-elimination"
import type { Player, Team } from "@/lib/types"

export default function EffectsOverlayPage() {
  const { teams } = useTeams()
  const [spotlightPlayer, setSpotlightPlayer] = useState<Player | null>(null)
  const [spotlightTeam, setSpotlightTeam] = useState<Team | null>(null)

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    // 1. Subscribe to Player Spotlight event
    const unsubSpotlight = sync.subscribe("PLAYER_SPOTLIGHT", (payload: unknown) => {
      const data = payload as { playerId: string }
      const team = teams.find((t) => t.players.some((p) => p.id === data.playerId))
      const player = team?.players.find((p) => p.id === data.playerId)
      if (player && team) {
        setSpotlightPlayer(player)
        setSpotlightTeam(team)
      }
    })

    return () => {
      unsubSpotlight()
    }
  }, [teams])

  return (
    <div className="w-screen h-screen relative obs-overlay overflow-hidden">
      {/* 🏆 MVP Cinematic Gold Overlay */}
      <MVPRevealOverlay />

      {/* 👤 Player Spotlight Overlay */}
      <PlayerSpotlight
        player={spotlightPlayer}
        team={spotlightTeam}
        onClose={() => {
          setSpotlightPlayer(null)
          setSpotlightTeam(null)
        }}
      />

      {/* 🍗 Winner Winner Chicken Dinner Celebration */}
      <WWCDCelebrationOverlay />

      {/* 💥 Team Wipe Alert */}
      <TeamWipeOverlay />

      {/* 🔥 Kill Streak Alert */}
      <KillStreakOverlay />

      {/* 🚨 Clutch Moment Indicator */}
      <ClutchMomentOverlay />

      {/* 🗺️ Zone Phase HUD widget */}
      <ZonePhaseOverlay position="top-right" />

      {/* 📦 Airdrop Alert */}
      <AirdropAlertOverlay />

      {/* ☄️ Hot Drop Alert */}
      <HotDropAlertOverlay />

      {/* 💀 Epic Elimination Splash */}
      <EpicElimination />
    </div>
  )
}
