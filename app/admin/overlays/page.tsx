"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useOverlayConfig, useTeams } from "@/lib/store"
import { Switch } from "@/components/ui/switch"
import { getRealtimeSync } from "@/lib/realtime"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import type { MVPData } from "@/lib/types"

export default function OverlaysPage() {
  const { config, updateConfig } = useOverlayConfig()
  const { teams } = useTeams()
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [previewUrl, setPreviewUrl] = useState("/overlay/effects")
  const [scale, setScale] = useState(0.3)
  const monitorContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (monitorContainerRef.current) {
        setScale(monitorContainerRef.current.clientWidth / 1920)
      }
    }
    handleResize()
    const timer = setTimeout(handleResize, 300) // Small delay for rendering bounds
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timer)
    }
  }, [])

  const overlays = [
    {
      name: "Cinematic Special Effects Overlay",
      description: "Dedicated transparent overlay for MVP Reveal, player spotlights, and WWCD celebration animations",
      url: "/overlay/effects",
      resolution: "1920x1080",
    },
    {
      name: "Full Broadcast Overlay",
      description: "Complete overlay with all elements for main broadcast",
      url: "/overlay/full",
      resolution: "1920x1080",
    },
    {
      name: "Broadcast Starting Soon Intro Screen",
      description: "Full-screen pre-match animation intro screen with sponsors, casters, map details and countdown clock",
      url: "/overlay/starting",
      resolution: "1920x1080",
    },
    {
      name: "Tournament Branding Logo Overlay",
      description: "Standalone elegant tournament info banner with official logo",
      url: "/overlay/branding",
      resolution: "400x120",
    },
    {
      name: "Rankings Panel",
      description: "Overall standings leaderboard",
      url: "/overlay/rankings",
      resolution: "400x800",
    },
    {
      name: "Kill Feed",
      description: "Real-time kill notifications",
      url: "/overlay/killfeed",
      resolution: "500x300",
    },
    {
      name: "Team Status Bar",
      description: "Horizontal team status for lower third",
      url: "/overlay/teams",
      resolution: "1920x100",
    },
    {
      name: "Top Fraggers",
      description: "Current match top killers",
      url: "/overlay/fraggers",
      resolution: "300x400",
    },
    {
      name: "Match Info",
      description: "Map, round, and player count info",
      url: "/overlay/matchinfo",
      resolution: "300x150",
    },
    {
      name: "Team Introduction",
      description: "Animated team intro card for pre-match",
      url: "/overlay/intro",
      resolution: "1920x1080",
    },
    {
      name: "Match Results",
      description: "Full standings reveal after match",
      url: "/overlay/results",
      resolution: "1920x1080",
    },
    {
      name: "Lower Third Ticker",
      description: "Scrolling standings ticker bar",
      url: "/overlay/lowerthird",
      resolution: "1920x80",
    },
    {
      name: "Player Spotlight",
      description: "Individual player highlight card",
      url: "/overlay/spotlight",
      resolution: "1920x1080",
    },
  ]

  const triggerTeamIntro = () => {
    const team = teams.find((t) => t.id === selectedTeamId)
    if (team) {
      getRealtimeSync()?.broadcast("TEAM_INTRO", { team })
    }
  }

  const triggerPlayerSpotlight = (playerId: string) => {
    getRealtimeSync()?.broadcast("PLAYER_SPOTLIGHT", { playerId })
  }

  // Quick Test Trigger Methods
  const triggerSampleMVP = () => {
    const sampleMVP: MVPData = {
      playerId: "p-sample-mvp",
      playerName: "PANTHER",
      teamShortName: "NV",
      teamLogo: "/nova-esports-gaming-logo-gold.jpg",
      teamColor: "#F1C40F",
      kills: 14,
      damage: 1850,
      survivalTime: "24:12",
      isWWCD: true,
      playerPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Panther",
    }
    getRealtimeSync()?.broadcast("MVP_REVEAL", sampleMVP)
  }

  const triggerSampleWWCD = () => {
    getRealtimeSync()?.broadcast("WWCD_TRIGGER", {
      teamId: "team-1",
      teamName: "Nova Esports",
      teamShortName: "NOVA",
      teamLogo: "",
      teamColor: "#FFD700",
      totalKills: 18,
      totalPoints: 28,
    })
  }

  const triggerSampleEpicKill = () => {
    getRealtimeSync()?.broadcast("ELIMINATION_EPIC", {
      id: `elim-${Date.now()}`,
      timestamp: new Date(),
      killerId: "t1-p1",
      killerName: "Order",
      killerTeam: "NOVA",
      victimId: "t2-p1",
      victimName: "33Syi",
      victimTeam: "4AM",
      weapon: "AWM",
      isKnock: false,
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider text-glow">Overlay Control & Monitor Deck</h1>
        <p className="text-muted-foreground">Configure overlay assets, trigger real-time animation cards, and watch updates live in the command viewport</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Columns (Settings & Broadcast Triggers) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Overlay Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>Toggle active broadcast elements on and off in real-time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Show Rankings</p>
                  <p className="text-xs text-muted-foreground">Display overall standings leaderboard panel</p>
                </div>
                <Switch
                  checked={config?.showRankings ?? true}
                  onCheckedChange={(checked) => updateConfig({ showRankings: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Show Kill Feed</p>
                  <p className="text-xs text-muted-foreground">Display real-time elimination and knock notifications</p>
                </div>
                <Switch
                  checked={config?.showKillFeed ?? true}
                  onCheckedChange={(checked) => updateConfig({ showKillFeed: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Show Team Status</p>
                  <p className="text-xs text-muted-foreground">Display active team lists and survival statuses</p>
                </div>
                <Switch
                  checked={config?.showTeamStatus ?? true}
                  onCheckedChange={(checked) => updateConfig({ showTeamStatus: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Show Zone Phase</p>
                  <p className="text-xs text-muted-foreground">Display circle counts and zone closure progress bars</p>
                </div>
                <Switch
                  checked={config?.showZonePhase ?? true}
                  onCheckedChange={(checked) => updateConfig({ showZonePhase: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Show Tournament Branding</p>
                  <p className="text-xs text-muted-foreground">Display the official tournament logo & name metadata</p>
                </div>
                <Switch
                  checked={config?.showBranding ?? true}
                  onCheckedChange={(checked) => updateConfig({ showBranding: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gold">Enable Advanced Framer Animations</p>
                  <p className="text-xs text-muted-foreground">Applies 3D transforms, elastic spring physics, and particle cascades</p>
                </div>
                <Switch
                  checked={config?.animationsEnabled ?? true}
                  onCheckedChange={(checked) => updateConfig({ animationsEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Trigger Control Panel */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Broadcast Controls</CardTitle>
              <CardDescription>Trigger dynamic card introductions and highlights manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border border-border bg-input text-foreground text-sm font-medium focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  <option value="">Select a team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.shortName})
                    </option>
                  ))}
                </select>
                <Button 
                  onClick={triggerTeamIntro} 
                  disabled={!selectedTeamId}
                  className="bg-gold hover:bg-gold/90 text-primary-foreground font-bold"
                >
                  Show Team Intro
                </Button>
              </div>

              <div className="border-t border-border/50 pt-4">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Quick Player Spotlight Trigger</p>
                <div className="flex flex-wrap gap-2">
                  {teams.slice(0, 4).flatMap((team) =>
                    team.players.slice(0, 2).map((player) => (
                      <Button 
                        key={player.id} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => triggerPlayerSpotlight(player.id)}
                        className="text-xs font-semibold"
                      >
                        {team.shortName} - {player.name}
                      </Button>
                    )),
                  )}
                </div>
              </div>

              <div className="border-t border-border/50 pt-4 flex gap-2">
                <Button variant="secondary" onClick={() => getRealtimeSync()?.broadcast("SHOW_RESULTS", {})} className="text-xs font-bold">
                  Show Match Results
                </Button>
                <Button variant="outline" onClick={() => getRealtimeSync()?.broadcast("FORCE_REFRESH", {})} className="text-xs font-bold text-destructive hover:bg-destructive/10">
                  Force Refresh All Screens
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overlay Grid Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {overlays.map((overlay) => (
              <Card key={overlay.url} className="bg-card border-border hover:border-gold/30 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold uppercase tracking-wider">{overlay.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">{overlay.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}${overlay.url}`}
                      readOnly
                      className="text-[10px] h-8 bg-zinc-950 font-mono select-all"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}${overlay.url}`)
                      }}
                      className="h-8 text-xs shrink-0"
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="flex gap-2 justify-between items-center text-xs">
                    <span className="text-[10px] text-muted-foreground font-semibold">Recommended: {overlay.resolution}</span>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setPreviewUrl(overlay.url)}
                        className="h-7 text-xs font-bold text-gold hover:bg-gold/10"
                      >
                        Monitor
                      </Button>
                      <Link href={overlay.url} target="_blank">
                        <Button variant="secondary" size="sm" className="h-7 text-xs font-bold">
                          Popout
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>

        {/* Right Column (Live Monitor Deck & OBS Instructions) */}
        <div className="space-y-6">
          
          {/* Live Overlay Monitor Viewport */}
          <Card className="bg-card border-border border-gold/20 shadow-lg shadow-gold/5">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-glow">
                  <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
                  Live Preview monitor
                </CardTitle>
                <select
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  className="h-8 px-2 rounded border border-border bg-input text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {overlays.map((o) => (
                    <option key={o.url} value={o.url}>{o.name}</option>
                  ))}
                </select>
              </div>
              <CardDescription>Live display showing selected transparent source. Updates reactively to all test triggers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Scaled viewport container */}
              <div 
                id="monitor-container"
                ref={monitorContainerRef}
                className="relative w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden border border-white/10 shadow-2xl relative"
              >
                {/* Chess grid transparent grid texture so users can see transparent layouts */}
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]" />
                
                <iframe
                  src={previewUrl}
                  className="absolute inset-0 border-0 origin-top-left pointer-events-none"
                  style={{
                    transform: `scale(${scale})`,
                    width: "1920px",
                    height: "1080px",
                  }}
                />
              </div>

              {/* Direct Animation Trigger Quick Buttons */}
              <div className="space-y-2 p-3 bg-secondary/35 border border-border/50 rounded-lg">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block mb-2 text-center">Interactive Quick Test Triggers</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={triggerSampleMVP}
                    className="bg-gold text-black hover:bg-gold/80 font-black text-[10px] tracking-wide h-8"
                  >
                    🏆 MVP
                  </Button>
                  <Button 
                    onClick={triggerSampleWWCD}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-black text-[10px] tracking-wide h-8"
                  >
                    🍗 WWCD
                  </Button>
                  <Button 
                    onClick={triggerSampleEpicKill}
                    className="bg-red-800 hover:bg-red-900 text-white font-black text-[10px] tracking-wide h-8"
                  >
                    💀 EPIC KILL
                  </Button>
                </div>
                <p className="text-[9px] text-muted-foreground text-center mt-1">
                  Click any trigger above and watch the Framer Motion spring card, confettis, and particles render instantly!
                </p>
              </div>

            </CardContent>
          </Card>

          {/* OBS Instructions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>OBS Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground font-medium">
                <li>Open OBS Studio and select your active scene.</li>
                <li>Click the <span className="text-gold font-bold">+</span> button under Sources and select <span className="font-bold">&quot;Browser&quot;</span>.</li>
                <li>Name your source (e.g., &quot;PUBG Kill Feed&quot;).</li>
                <li>Copy the overlay URL from the left cards and paste it into URL.</li>
                <li>Set the width and height to match the recommended resolution.</li>
                <li>Check <span className="font-bold">&quot;Enable browser source hardware acceleration&quot;</span> in OBS settings for smooth 60fps renders.</li>
                <li>Position the source on your canvas layer stack.</li>
              </ol>
              <div className="p-3 bg-zinc-950 rounded-lg border border-white/5 text-muted-foreground text-[10px] leading-relaxed">
                <strong>Tip:</strong> Keep the browser source layered above game capture feeds. Our transparent background properties seamlessly composite animations directly over the gaming feed.
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  )
}
