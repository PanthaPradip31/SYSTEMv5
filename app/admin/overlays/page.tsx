"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useOverlayConfig, useTeams } from "@/lib/store"
import { Switch } from "@/components/ui/switch"
import { getRealtimeSync } from "@/lib/realtime"
import Link from "next/link"
import { useState } from "react"

export default function OverlaysPage() {
  const { config, updateConfig } = useOverlayConfig()
  const { teams } = useTeams()
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overlay Configuration</h1>
        <p className="text-muted-foreground">Configure and preview broadcast overlays for OBS</p>
      </div>

      {/* Overlay Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>Toggle overlay elements on/off</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Rankings</p>
              <p className="text-sm text-muted-foreground">Display overall standings panel</p>
            </div>
            <Switch
              checked={config?.showRankings ?? true}
              onCheckedChange={(checked) => updateConfig({ showRankings: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Kill Feed</p>
              <p className="text-sm text-muted-foreground">Display real-time kill notifications</p>
            </div>
            <Switch
              checked={config?.showKillFeed ?? true}
              onCheckedChange={(checked) => updateConfig({ showKillFeed: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Team Status</p>
              <p className="text-sm text-muted-foreground">Display team alive/knocked/eliminated status</p>
            </div>
            <Switch
              checked={config?.showTeamStatus ?? true}
              onCheckedChange={(checked) => updateConfig({ showTeamStatus: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Zone Phase</p>
              <p className="text-sm text-muted-foreground">Display the live zone phase countdown</p>
            </div>
            <Switch
              checked={config?.showZonePhase ?? true}
              onCheckedChange={(checked) => updateConfig({ showZonePhase: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Tournament Branding</p>
              <p className="text-sm text-muted-foreground">Display the official tournament logo & name</p>
            </div>
            <Switch
              checked={config?.showBranding ?? true}
              onCheckedChange={(checked) => updateConfig({ showBranding: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Animations</p>
              <p className="text-sm text-muted-foreground">Smooth transitions and effects</p>
            </div>
            <Switch
              checked={config?.animationsEnabled ?? true}
              onCheckedChange={(checked) => updateConfig({ animationsEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Broadcast Controls</CardTitle>
          <CardDescription>Trigger overlay animations during broadcast</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="flex-1 h-10 px-3 rounded-md border border-border bg-input text-foreground"
            >
              <option value="">Select a team...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.shortName})
                </option>
              ))}
            </select>
            <Button onClick={triggerTeamIntro} disabled={!selectedTeamId}>
              Show Team Intro
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium mb-2">Quick Player Spotlight</p>
            <div className="flex flex-wrap gap-2">
              {teams.slice(0, 4).flatMap((team) =>
                team.players.slice(0, 2).map((player) => (
                  <Button key={player.id} variant="outline" size="sm" onClick={() => triggerPlayerSpotlight(player.id)}>
                    {team.shortName} - {player.name}
                  </Button>
                )),
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4 flex gap-2">
            <Button variant="secondary" onClick={() => getRealtimeSync()?.broadcast("SHOW_RESULTS", {})}>
              Show Match Results
            </Button>
            <Button variant="outline" onClick={() => getRealtimeSync()?.broadcast("FORCE_REFRESH", {})}>
              Force Refresh All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overlay URLs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {overlays.map((overlay) => (
          <Card key={overlay.url} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{overlay.name}</CardTitle>
              <CardDescription>{overlay.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}${overlay.url}`}
                  readOnly
                  className="text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${overlay.url}`)
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Recommended: {overlay.resolution}</p>
              <Link href={overlay.url} target="_blank">
                <Button variant="secondary" size="sm" className="w-full">
                  Preview
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* OBS Instructions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>OBS Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Open OBS Studio and select your scene</li>
            <li>Click the + button under Sources and select &quot;Browser&quot;</li>
            <li>Name your source (e.g., &quot;PUBG Rankings&quot;)</li>
            <li>Paste the overlay URL from above</li>
            <li>Set the width and height to match the recommended resolution</li>
            <li>Check &quot;Refresh browser when scene becomes active&quot; if needed</li>
            <li>Click OK and position the overlay in your scene</li>
          </ol>
          <p className="text-muted-foreground mt-4">
            <strong>Tip:</strong> Use the transparent background overlays and layer them over your game capture for the
            best results.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
