"use client"

import { useRealtimeSync } from "@/lib/realtime"
import { TournamentBranding } from "@/components/overlays/tournament-branding"

export default function TournamentBrandingOverlayPage() {
  useRealtimeSync()

  return (
    <div className="min-h-screen obs-overlay relative">
      <TournamentBranding position="bottom-left" />
    </div>
  )
}
