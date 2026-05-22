"use client"

import { useRealtimeSync } from "@/lib/realtime"
import { LiveRankings } from "@/components/overlays/live-rankings"

export default function RankingsOverlayPage() {
  useRealtimeSync()

  return (
    <div className="w-screen h-screen flex items-center justify-center obs-overlay bg-[#050508] relative overflow-hidden select-none p-8">
      {/* Cinematic PUBG Mobile Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 pointer-events-none"
        style={{ backgroundImage: "url('/pubg-background.png')" }}
      />
      {/* Dark overlay to guarantee perfect text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/85 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_80%)] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <LiveRankings showTop={16} variant="full" />
      </div>
    </div>
  )
}
