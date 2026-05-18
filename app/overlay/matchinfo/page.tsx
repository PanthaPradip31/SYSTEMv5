"use client"

import { useRealtimeSync } from "@/lib/realtime"
import { MatchInfo } from "@/components/overlays/match-info"

export default function MatchInfoOverlayPage() {
  useRealtimeSync()

  return (
    <div className="min-h-screen obs-overlay p-4">
      <MatchInfo />
    </div>
  )
}
