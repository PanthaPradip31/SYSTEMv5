"use client"

import { useRealtimeSync } from "@/lib/realtime"
import { LiveRankings } from "@/components/overlays/live-rankings"
import { KillFeed } from "@/components/overlays/kill-feed"
import { TeamStatus } from "@/components/overlays/team-status"
import { MatchInfo } from "@/components/overlays/match-info"
import { TopFraggers } from "@/components/overlays/top-fraggers"
import { EpicElimination } from "@/components/overlays/epic-elimination"
import { KillStreakOverlay } from "@/components/overlays/kill-streak"
import { TeamWipeOverlay } from "@/components/overlays/team-wipe"
import { ClutchMomentOverlay } from "@/components/overlays/clutch-moment"
import { ZonePhaseOverlay } from "@/components/overlays/zone-phase"
import { AirdropAlertOverlay } from "@/components/overlays/airdrop-alert"
import { MVPRevealOverlay } from "@/components/overlays/mvp-reveal"
import { WWCDCelebrationOverlay } from "@/components/overlays/wwcd-celebration"
import { HotDropAlertOverlay } from "@/components/overlays/hot-drop-alert"
import { TournamentBranding } from "@/components/overlays/tournament-branding"

export default function UltimateOverlayPage() {
  useRealtimeSync()

  return (
    <div className="relative w-full h-screen bg-transparent overflow-hidden obs-overlay">
      {/* Base overlay elements */}

      {/* Top bar - Match info and team status */}
      <div className="absolute top-0 left-0 right-0 p-4">
        <div className="flex items-start justify-between">
          <MatchInfo />
          <ZonePhaseOverlay position="top-right" />
        </div>
        <div className="mt-2">
          <TeamStatus variant="horizontal" showKills />
        </div>
      </div>

      {/* Left side - Rankings */}
      <div className="absolute left-4 top-32 bottom-20">
        <LiveRankings showTop={8} />
      </div>

      {/* Right side - Kill feed and top fraggers */}
      <div className="absolute right-4 top-32 w-80 space-y-4">
        <TopFraggers count={5} />
        <KillFeed maxItems={6} />
      </div>

      {/* Floating Tournament Branding Logo above bottom grid */}
      <TournamentBranding position="bottom-left" className="bottom-24 z-30" />

      {/* Bottom - Full team status grid */}
      <div className="absolute bottom-4 left-4 right-4">
        <TeamStatus variant="grid" showKills />
      </div>

      {/* Special event overlays - these appear on top when triggered */}
      <EpicElimination />
      <KillStreakOverlay />
      <TeamWipeOverlay />
      <ClutchMomentOverlay />
      <AirdropAlertOverlay />
      <HotDropAlertOverlay />
      <MVPRevealOverlay />
      <WWCDCelebrationOverlay />
    </div>
  )
}
