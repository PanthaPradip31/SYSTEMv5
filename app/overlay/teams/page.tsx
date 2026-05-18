"use client"

import { useRealtimeSync } from "@/lib/realtime"
import { TeamStatus } from "@/components/overlays/team-status"

export default function TeamsOverlayPage() {
  useRealtimeSync()

  return (
    <div className="min-h-screen obs-overlay p-4">
      <TeamStatus variant="grid" showKills />
    </div>
  )
}
