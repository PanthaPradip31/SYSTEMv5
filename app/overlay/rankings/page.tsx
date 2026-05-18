"use client"

import { useRealtimeSync } from "@/lib/realtime"
import { LiveRankings } from "@/components/overlays/live-rankings"

export default function RankingsOverlayPage() {
  useRealtimeSync()

  return (
    <div className="min-h-screen obs-overlay p-4">
      <LiveRankings showTop={16} variant="full" />
    </div>
  )
}
