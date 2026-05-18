"use client"

import { MatchResults } from "@/components/overlays/match-results"
import { useRealtimeSync } from "@/lib/realtime"

export default function ResultsOverlayPage() {
  useRealtimeSync()

  return (
    <div className="w-screen h-screen flex items-center justify-center obs-overlay bg-background/95">
      <MatchResults showTop={16} />
    </div>
  )
}
