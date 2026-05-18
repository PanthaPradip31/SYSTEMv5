"use client"

import { useOverlayConfig, useTournament } from "@/lib/store"
import { cn } from "@/lib/utils"

interface TournamentBrandingProps {
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right"
  className?: string
}

export function TournamentBranding({ position = "bottom-left", className }: TournamentBrandingProps) {
  const { config } = useOverlayConfig()
  const { tournament } = useTournament()

  if (config?.showBranding === false) return null

  const displayLogo = config?.tournamentLogo || ""
  const displayName = config?.tournamentName || tournament?.name || "PUBG TOURNAMENT"
  const displayFormat = tournament?.format ? `${tournament.format.toUpperCase()} MATCH` : "SQUAD MATCH"
  const displayStatus = tournament?.status ? tournament.status.toUpperCase() : "LIVE"

  const positionClasses = {
    "bottom-left": "bottom-6 left-6",
    "bottom-right": "bottom-6 right-6",
    "top-left": "top-6 left-6",
    "top-right": "top-6 right-6",
  }

  return (
    <div
      className={cn(
        "fixed z-20 transition-all duration-500 ease-out animate-fade-in",
        positionClasses[position],
        className
      )}
    >
      <div className="flex items-center gap-4 bg-gradient-to-r from-black/90 via-black/80 to-black/40 backdrop-blur-md px-4 py-3 rounded-xl border-l-4 border-y border-r border-y-white/10 border-r-white/5 shadow-2xl shadow-black/80 border-l-gold animate-slide-in">
        {/* Logo Container */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-secondary/80 to-black/80 border border-gold/30 p-1 shadow-inner shrink-0 overflow-hidden group">
          {/* Animated golden aura */}
          <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
          
          {displayLogo ? (
            <img
              src={displayLogo}
              alt="Tournament Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              onError={(e) => {
                // If image fails to load, fallback to default SVG
                e.currentTarget.style.display = "none"
                const fallback = e.currentTarget.parentElement?.querySelector(".fallback-svg")
                if (fallback) fallback.classList.remove("hidden")
              }}
            />
          ) : null}

          {/* Premium Fallback/Default SVG Esports Badge */}
          <svg
            className={cn(
              "fallback-svg w-10 h-10 text-gold filter drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] animate-pulse",
              displayLogo ? "hidden" : ""
            )}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* Elegant shield with star & crosshair */}
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 4a3 3 0 110 6 3 3 0 010-6zm0 10.5c-2.33 0-4.5-.83-6-2.22V11c0-1.8 3.6-2.7 6-2.7s6 .9 6 2.7v3.28c-1.5 1.39-3.67 2.22-6 2.22z" />
          </svg>
        </div>

        {/* Text Details */}
        <div className="flex flex-col pr-4 select-none">
          <div className="text-xs font-bold tracking-widest text-gold uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] animate-pulse-slow">
            {displayStatus}
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-wide leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans">
            {displayName}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {displayFormat}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
          </div>
        </div>
      </div>
    </div>
  )
}
