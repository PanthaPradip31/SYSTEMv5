"use client"

import { useEffect, useState } from "react"
import { useIntroConfig, useTeams } from "@/lib/store"
import { cn } from "@/lib/utils"

export function BroadcastIntro() {
  const { config } = useIntroConfig()
  const { teams } = useTeams()
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

  // Combine Sponsors and Teams into alternating array for high-end news crawler look
  const tickerItems: Array<
    | { type: "sponsor"; id: string; name: string; mediaType: "image" | "video"; logoUrl?: string; videoUrl?: string }
    | { type: "team"; id: string; name: string; shortName: string; logo?: string; color: string }
  > = []

  const sponsorsList = config.sponsors || []
  const teamsList = teams || []
  const maxItems = Math.max(sponsorsList.length, teamsList.length)
  for (let i = 0; i < maxItems; i++) {
    if (sponsorsList[i]) {
      tickerItems.push({
        type: "sponsor",
        id: sponsorsList[i].id,
        name: sponsorsList[i].name,
        mediaType: sponsorsList[i].mediaType,
        logoUrl: sponsorsList[i].logoUrl,
        videoUrl: sponsorsList[i].videoUrl,
      })
    }
    if (teamsList[i]) {
      tickerItems.push({
        type: "team",
        id: teamsList[i].id,
        name: teamsList[i].name,
        shortName: teamsList[i].shortName,
        logo: teamsList[i].logo,
        color: teamsList[i].color,
      })
    }
  }

  return (
    <div className="w-screen h-screen bg-[#050508] text-white overflow-hidden relative font-sans flex flex-col justify-between p-12 select-none">
      {/* Cinematic PUBG Mobile Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 pointer-events-none"
        style={{ backgroundImage: "url('/pubg-background.png')" }}
      />
      {/* Dark overlay to guarantee perfect text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/85 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_80%)] pointer-events-none" />
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
                    
                    {(caster.instagram || caster.twitter) ? (
                      <div className="flex gap-2 mt-1 font-mono text-[9px] flex-wrap">
                        {caster.instagram && (
                          <span className="flex items-center gap-0.5 text-pink-400 font-bold">
                            📸 @{caster.instagram}
                          </span>
                        )}
                        {caster.twitter && (
                          <span className="flex items-center gap-0.5 text-sky-400 font-bold">
                            🐦 @{caster.twitter}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground font-semibold">PUBG MOBILE CASTER</p>
                    )}
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

      {/* Footer Section: Sponsors / Partners News Marquee bar */}
      <div className="z-10 w-full max-w-7xl mx-auto">
        <div className="w-full bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden flex items-center relative shadow-[0_0_20px_rgba(0,0,0,0.8)] h-20">
          
          {/* Static Left Tag: Professional Broadcast News Style with Local PUBG Mobile Logo */}
          <div className="h-full px-6 flex items-center justify-center bg-zinc-900 shrink-0 shadow-[4px_0_15px_rgba(0,0,0,0.6)] z-20 border-r border-white/10 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-transparent opacity-50 pointer-events-none" />
            <img 
              src="/pubg-mobile-logo.png" 
              alt="PUBG Mobile Logo" 
              className="h-12 object-contain drop-shadow-[0_0_8px_rgba(230,179,37,0.4)] relative z-10 select-none animate-pulse" 
              style={{ animationDuration: "3s" }}
            />
          </div>

          {/* Scrolling Ticker Track */}
          <div className="flex-1 h-full overflow-hidden relative flex items-center bg-black/40">
            {/* Cinematic fade blurs inside scrolling belt */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
            
            <style>{`
              @keyframes news-ticker-rtl {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-33.33%); }
              }
              .animate-news-ticker-rtl {
                display: flex;
                align-items: center;
                gap: 4rem;
                width: max-content;
                animation: news-ticker-rtl 32s linear infinite;
              }
              .animate-news-ticker-rtl:hover {
                animation-play-state: paused;
              }
            `}</style>

            <div className="animate-news-ticker-rtl">
              {tickerItems.length > 0 ? (
                // Duplicate elements to ensure smooth infinite loop coverage from Right to Left
                [...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
                  <div key={`${item.id}-${index}`} className="shrink-0 transition-all duration-300">
                    
                    {item.type === "sponsor" ? (
                      // Gorgeous glowing sponsor media card
                      <div className="flex items-center gap-2 grayscale hover:grayscale-0 opacity-85 hover:opacity-100 transition-all duration-300 bg-white/5 border border-white/10 rounded-xl px-4 py-2 hover:border-gold/30 hover:shadow-[0_0_12px_rgba(218,165,32,0.25)]">
                        {item.mediaType === "video" && item.videoUrl ? (
                          <video
                            src={item.videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="h-12 object-contain rounded bg-black/40 border border-white/5 max-w-[180px]"
                          />
                        ) : item.logoUrl ? (
                          <img src={item.logoUrl} alt={item.name} className="h-10 object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]" />
                        ) : (
                          <span className="text-xs font-black uppercase text-white/80 tracking-widest">{item.name}</span>
                        )}
                      </div>
                    ) : (
                      // Breathtaking neon esports combatant team card
                      <div 
                        className="flex items-center gap-3 bg-zinc-950/60 border border-white/5 rounded-xl px-4 py-2 hover:border-white/20 transition-all shadow-md"
                        style={{ borderLeft: `3px solid ${item.color || "#FFD700"}` }}
                      >
                        {item.logo ? (
                          <img src={item.logo} alt={item.name} className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(255,255,255,0.15)]" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center font-bold text-xs uppercase text-muted-foreground shrink-0">
                            {item.shortName ? item.shortName[0] : "T"}
                          </div>
                        )}
                        <div className="flex flex-col justify-center leading-none text-left">
                          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: item.color || "#FFD700" }}>
                            {item.shortName}
                          </span>
                          <span className="text-xs font-extrabold text-white uppercase tracking-wide mt-0.5 whitespace-nowrap">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    )}

                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground pl-6 uppercase tracking-wider font-semibold">Official Scrims partners and sponsors</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
