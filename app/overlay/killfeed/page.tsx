"use client"

import { useRealtimeSync } from "@/lib/realtime"
import { KillFeed } from "@/components/overlays/kill-feed"

export default function KillFeedOverlayPage() {
  useRealtimeSync()

  return (
    <div className="min-h-screen obs-overlay p-4">
      <KillFeed maxItems={10} />
    </div>
  )
}
