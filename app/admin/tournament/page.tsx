"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTournament, useStandings, useTeams, useOverlayConfig } from "@/lib/store"
import { LiveRankings } from "@/components/overlays/live-rankings"
import { Switch } from "@/components/ui/switch"
import type { TeamStanding } from "@/lib/types"

export default function TournamentPage() {
  const { tournament, updateTournament } = useTournament()
  const { teams } = useTeams()
  const { standings, updateStandings } = useStandings()
  const { config, updateConfig } = useOverlayConfig()
  
  const [tournamentName, setTournamentName] = useState(tournament?.name || "")
  const [logoUrl, setLogoUrl] = useState("")
  const [customName, setCustomName] = useState("")
  const [hasSynced, setHasSynced] = useState(false)

  if (config && !hasSynced) {
    setLogoUrl(config.tournamentLogo || "")
    setCustomName(config.tournamentName || "")
    setHasSynced(true)
  }

  const handleInitializeStandings = () => {
    const initialStandings: TeamStanding[] = teams.map((team, index) => ({
      teamId: team.id,
      team,
      rank: index + 1,
      totalPoints: 0,
      totalKills: 0,
      placementPoints: 0,
      killPoints: 0,
      wwcd: 0,
      matches: [],
    }))
    updateStandings(initialStandings)
  }

  const handleUpdateName = () => {
    updateTournament({ name: tournamentName })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tournament Setup</h1>
        <p className="text-muted-foreground">Configure tournament settings and view standings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tournament Settings */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Tournament Info</CardTitle>
              <CardDescription>Basic tournament configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tournament Name</label>
                <div className="flex gap-2">
                  <Input
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    placeholder="Enter tournament name"
                  />
                  <Button onClick={handleUpdateName}>Save</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Format</label>
                  <select
                    className="w-full px-3 py-2 rounded-md bg-input border border-border"
                    value={tournament?.format || "squad"}
                    onChange={(e) => updateTournament({ format: e.target.value as "solo" | "duo" | "squad" })}
                  >
                    <option value="solo">Solo</option>
                    <option value="duo">Duo</option>
                    <option value="squad">Squad</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <select
                    className="w-full px-3 py-2 rounded-md bg-input border border-border"
                    value={tournament?.status || "setup"}
                    onChange={(e) => updateTournament({ status: e.target.value as "setup" | "live" | "finished" })}
                  >
                    <option value="setup">Setup</option>
                    <option value="live">Live</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tournament Branding & Logo Setup */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Branding & Official Logo</CardTitle>
              <CardDescription>Setup custom branding and official tournament logo overlays</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div>
                  <p className="font-semibold text-sm">Show Branding Overlay</p>
                  <p className="text-xs text-muted-foreground">Toggle official logo overlay on/off</p>
                </div>
                <Switch
                  checked={config?.showBranding ?? true}
                  onCheckedChange={(checked) => updateConfig({ showBranding: checked })}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Branding Name</label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="E.g., PMGC 2026 FINALS"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Official Logo URL</label>
                  <div className="flex gap-2">
                    <Input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Paste image URL (png, svg, jpg)"
                    />
                    <Button 
                      onClick={() => updateConfig({ tournamentLogo: logoUrl, tournamentName: customName })} 
                      className="bg-gold hover:bg-gold/90 text-primary-foreground font-semibold"
                    >
                      Save Branding
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Leave empty to display a premium fallback SVG Esports badge</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Standings Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Teams registered: <strong>{teams.length}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Standings initialized: <strong>{standings.length > 0 ? "Yes" : "No"}</strong>
              </p>
              <Button
                onClick={handleInitializeStandings}
                className="w-full"
                variant={standings.length > 0 ? "destructive" : "default"}
              >
                {standings.length > 0 ? "Reset Standings" : "Initialize Standings"}
              </Button>
            </CardContent>
          </Card>

          {/* Point System */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Point System</CardTitle>
              <CardDescription>Official PUBG Mobile scoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2 text-sm">
                  <div className="text-center p-2 bg-secondary rounded border border-gold border-opacity-50">
                    <div className="font-bold text-gold text-xs">1st</div>
                    <div className="font-bold text-gold">10 pts</div>
                    <div className="text-xs text-muted-foreground">WWCD</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="font-bold text-xs">2nd</div>
                    <div className="font-bold">6 pts</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="font-bold text-xs">3rd</div>
                    <div className="font-bold">5 pts</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="font-bold text-xs">4th</div>
                    <div className="font-bold">4 pts</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="font-bold text-xs">5th</div>
                    <div className="font-bold">3 pts</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="font-bold text-xs">6th</div>
                    <div className="font-bold">2 pts</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="font-bold text-xs">7th</div>
                    <div className="font-bold">1 pts</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="font-bold text-xs">8th</div>
                    <div className="font-bold">1 pt</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="font-bold text-xs">9th-16th</div>
                    <div className="font-bold">0 pt</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center font-semibold">+ 1 point per kill (applies to all placements)</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">9th place and over: 0 points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Standings Preview */}
        <div>
          <h2 className="text-xl font-bold mb-4">Standings Preview</h2>
          {standings.length > 0 ? (
            <LiveRankings showTop={16} variant="full" />
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No standings initialized yet</p>
                <p className="text-sm text-muted-foreground mt-2">Add teams first, then initialize standings</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
