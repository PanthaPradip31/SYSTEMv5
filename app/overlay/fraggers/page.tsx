"use client"

import { useRealtimeSync } from "@/lib/realtime"
import { TopFraggers } from "@/components/overlays/top-fraggers"

export default function FraggersOverlayPage() {
  useRealtimeSync()

  return (
    <div className="min-h-screen obs-overlay p-4">
      <TopFraggers count={10} />
    </div>
  )
}
