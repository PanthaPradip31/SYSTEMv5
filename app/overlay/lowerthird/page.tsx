"use client"

import { LowerThird } from "@/components/overlays/lower-third"
import { useRealtimeSync } from "@/lib/realtime"

export default function LowerThirdOverlayPage() {
  useRealtimeSync()

  return (
    <div className="w-screen h-screen flex items-end obs-overlay">
      <LowerThird showTop={8} />
    </div>
  )
}
