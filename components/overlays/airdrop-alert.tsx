"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useRealtimeSync, getRealtimeSync, type SyncEventType } from "@/lib/realtime"
import type { AirdropEvent } from "@/lib/types"

interface AirdropAlertOverlayProps {
  className?: string
}

export function AirdropAlertOverlay({ className }: AirdropAlertOverlayProps) {
  const [airdrop, setAirdrop] = useState<AirdropEvent | null>(null)

  useRealtimeSync()

  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    const unsub = sync.subscribe("AIRDROP" as SyncEventType, (payload) => {
      setAirdrop(payload as AirdropEvent)

      setTimeout(() => setAirdrop(null), 5000)
    })

    return () => unsub()
  }, [])

  if (!airdrop) return null

  return (
    <div className={cn("fixed top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-50", className)}>
      <div className="relative animate-airdrop-drop">
        {/* Parachute */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-parachute">
          <svg className="w-24 h-16 text-white" viewBox="0 0 100 60" fill="currentColor">
            <path d="M50 0 C20 0 0 30 0 30 L50 60 L100 30 C100 30 80 0 50 0" opacity="0.8" />
            <line x1="0" y1="30" x2="50" y2="60" stroke="currentColor" strokeWidth="1" />
            <line x1="100" y1="30" x2="50" y2="60" stroke="currentColor" strokeWidth="1" />
            <line x1="50" y1="0" x2="50" y2="60" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Crate */}
        <div className="bg-gradient-to-b from-orange-500 to-orange-700 p-6 rounded-lg border-4 border-orange-400 shadow-2xl box-glow-gold">
          <div className="text-center">
            <div className="text-orange-200 text-xs font-bold uppercase tracking-[0.3em] mb-2">Incoming</div>
            <div className="text-white text-3xl font-black uppercase">Airdrop</div>
            {airdrop.location && <div className="text-orange-200 text-sm mt-2">{airdrop.location}</div>}
          </div>

          {/* Crate icon */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <div className="bg-orange-600 p-2 rounded border-2 border-orange-400">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L5 8.09v7.82l7 3.94l7-3.94V8.09l-7-3.94z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full" />
      </div>
    </div>
  )
}
