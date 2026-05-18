"use client"

import { useState, useEffect } from "react"
import { useOverlayConfig, useTeams } from "@/lib/store"
import { useRealtimeSync, getRealtimeSync } from "@/lib/realtime"
import { LiveRankings } from "@/components/overlays/live-rankings"
import { KillFeed } from "@/components/overlays/kill-feed"
import { TeamStatus } from "@/components/overlays/team-status"
import { MatchInfo } from "@/components/overlays/match-info"
import { TopFraggers } from "@/components/overlays/top-fraggers"
import { WWCDBanner } from "@/components/overlays/wwcd-banner"
import { ZonePhaseOverlay } from "@/components/overlays/zone-phase"
import { TournamentBranding } from "@/components/overlays/tournament-branding"
import type { Team } from "@/lib/types"

export default function FullOverlayPage() {
  const { config } = useOverlayConfig()
  const { teams } = useTeams()
  const [wwcdTeam, setWwcdTeam] = useState<Team | null>(null)
  const [wwcdKills, setWwcdKills] = useState(0)

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsubscribe = sync.subscribe("WWCD_TRIGGER", (payload: unknown) => {
      const data = payload as { team: Team; kills: number }
      setWwcdTeam(data.team)
      setWwcdKills(data.kills)
    })

    return unsubscribe
  }, [])

  return (
    <div className="w-screen h-screen relative obs-overlay overflow-hidden">
      {/* Top Left - Match Info */}
      {config?.showMatchInfo && (
        <div className="absolute top-4 left-4 w-72">
          <MatchInfo />
        </div>
      )}

      {/* Zone Phase Countdown (placed below Match Info) */}
      <ZonePhaseOverlay position="top-left" className="top-28 w-72" />

      {/* Top Right - Kill Feed */}
      {config?.showKillFeed && (
        <div className="absolute top-4 right-4 w-96">
          <KillFeed maxItems={6} />
        </div>
      )}

      {/* Bottom Left - Rankings */}
      {config?.showRankings && (
        <div className="absolute bottom-4 left-4 w-80">
          <LiveRankings showTop={8} variant="compact" />
        </div>
      )}

      {/* Bottom Left - Tournament Branding & Official Logo */}
      <TournamentBranding position="bottom-left" />

      {/* Bottom Center - Team Status */}
      {config?.showTeamStatus && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <TeamStatus variant="horizontal" showKills />
        </div>
      )}

      {/* Right Side - Top Fraggers */}
      <div className="absolute top-1/3 right-4 w-64">
        <TopFraggers count={5} />
      </div>

      <WWCDBanner team={wwcdTeam} kills={wwcdKills} onClose={() => setWwcdTeam(null)} />
    </div>
  )
}

