"use client"

import { useRealtimeSync } from "@/lib/realtime"
import { BroadcastIntro } from "@/components/overlays/broadcast-intro"

export default function BroadcastIntroPage() {
  useRealtimeSync()

  return (
    <div className="w-screen h-screen overflow-hidden obs-overlay">
      <BroadcastIntro />
    </div>
  )
}
