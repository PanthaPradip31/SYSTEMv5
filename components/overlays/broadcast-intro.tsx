"use client"

import { useEffect, useState } from "react"
import { useIntroConfig } from "@/lib/store"
import { cn } from "@/lib/utils"

export function BroadcastIntro() {
  const { config } = useIntroConfig()
  const [timeLeft, setTimeLeft] = useState(0)
  const [isCounting, setIsCounting] = useState(false)

  // Initialize and synchronize countdown timer from config
  useEffect(() => {
    if (!config) return
    setTimeLeft(config.countdownMinutes * 60)
    setIsCounting(config.showCountdown)
  }, [config?.countdownMinutes, config?.showCountdown])

  // Decrement countdown timer
  useEffect(() => {
    if (!isCounting || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isCounting, timeLeft])

  if (!config) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate countdown ring progress
  const totalSeconds = config.countdownMinutes * 60
  const progressPercent = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0
  const strokeDashoffset = 282.7 - (282.7 * progressPercent) / 100

  return (
    <div className="w-screen h-screen bg-[#07070b] text-white overflow-hidden relative font-sans flex flex-col justify-between p-12">
      {/* Dynamic Background FX */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

      {/* Header Info: Tournament, Scrim and Map Details */}
      <div className="flex justify-between items-start z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="bg-gold text-primary-foreground text-xs font-black px-2 py-0.5 rounded tracking-widest uppercase">
              {config.scrimTitle ? "SCRIM" : "TOURNAMENT"}
            </span>
            <div className="w-2 h-2 rounded-full bg-alive animate-ping" />
          </div>
          <h1 className="text-3xl font-black tracking-wider uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {config.tournamentTitle}
          </h1>
          <p className="text-sm font-semibold tracking-widest text-gold uppercase">
            {config.scrimTitle || "CHAMPIONSHIP SERIES"}
          </p>
        </div>

        {/* Map / Round Card */}
        <div className="flex gap-4 items-center bg-black/60 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10 shadow-lg shadow-black/40">
          <div className="text-right">
            <span className="text-[10px] block font-bold text-muted-foreground uppercase tracking-widest">MAP NAME</span>
            <span className="text-lg font-black text-white tracking-wide uppercase">{config.mapName}</span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div>
            <span className="text-[10px] block font-bold text-muted-foreground uppercase tracking-widest">ROUND</span>
            <span className="text-lg font-black text-gold tracking-wide uppercase">{config.matchRound}</span>
          </div>
        </div>
      </div>

      {/* Center Layout: Big Timer Countdown + Casters Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto z-10 w-full max-w-7xl mx-auto">
        
        {/* Left/Center Column: Big Neon Countdown */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-6">
          <h2 className="text-sm font-black tracking-widest text-muted-foreground uppercase">
            {timeLeft > 0 ? (config.streamTitle || "STREAM STARTING SOON") : "MATCH LIVE / JOINING LOBBY"}
          </h2>

          <div className="relative flex items-center justify-center w-64 h-64">
            {/* SVG Ring Progress */}
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-white/5 fill-none"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-gold fill-none transition-all duration-1000 ease-linear filter drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                strokeWidth="4"
                strokeDasharray="282.7"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Countdown Text */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className={cn(
                "text-6xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]",
                timeLeft <= 10 && timeLeft > 0 && "text-destructive animate-pulse"
              )}>
                {timeLeft > 0 ? formatTime(timeLeft) : "GO!"}
              </span>
              <span className="text-[10px] font-bold text-gold tracking-widest uppercase mt-1">
                {timeLeft > 0 ? "COUNTDOWN" : "LOBBY OPEN"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Casters Introduction Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-gold rounded" />
            <h3 className="text-xs font-black tracking-widest uppercase text-muted-foreground">TODAY'S CASTERS</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.casters.length > 0 ? (
              config.casters.map((caster, index) => (
                <div
                  key={caster.id || index}
                  className="group relative flex gap-4 items-center bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-2xl hover:border-gold/30 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/5 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  {/* Photo Frame */}
                  <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {caster.photo ? (
                      <img src={caster.photo} alt={caster.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>

                  <div>
                    <span className="text-[9px] font-black tracking-wider text-gold uppercase">{caster.role || "ON-AIR CASTER"}</span>
                    <h4 className="text-base font-extrabold text-white tracking-wide uppercase mt-0.5">{caster.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-semibold">PUBG MOBILE CASTER</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-6 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-muted-foreground">No casters currently assigned</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer Section: Sponsors / Partners Marquee bar */}
      <div className="z-10 w-full max-w-7xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-3 bg-gold rounded" />
          <h3 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">OFFICIAL TOURNAMENT SPONSORS</h3>
        </div>

        <div className="w-full bg-black/40 border border-white/5 rounded-xl px-6 py-4 flex items-center gap-8 overflow-hidden relative">
          <div className="flex flex-wrap items-center gap-12 justify-center w-full">
            {config.sponsors.length > 0 ? (
              config.sponsors.map((sponsor, index) => (
                <div key={sponsor.id || index} className="flex items-center gap-2 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                  {sponsor.logoUrl ? (
                    <img src={sponsor.logoUrl} alt={sponsor.name} className="h-6 object-contain" />
                  ) : (
                    <div className="flex items-center gap-2 border border-white/10 px-3 py-1 rounded bg-white/5">
                      <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span className="text-xs font-black uppercase text-white/80 tracking-widest">{sponsor.name}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Official Scrims partners and sponsors</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
