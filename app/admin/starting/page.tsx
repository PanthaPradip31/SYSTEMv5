"use client"

import { useState } from "react"
import { useIntroConfig } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { MAPS, Caster, Sponsor } from "@/lib/types"

export default function BroadcastStartingSetupPage() {
  const { config, updateConfig } = useIntroConfig()

  // Form input local states
  const [tournamentTitle, setTournamentTitle] = useState("")
  const [scrimTitle, setScrimTitle] = useState("")
  const [matchRound, setMatchRound] = useState("")
  const [mapName, setMapName] = useState("Erangel")
  const [countdownMinutes, setCountdownMinutes] = useState(5)
  const [showCountdown, setShowCountdown] = useState(true)
  const [streamTitle, setStreamTitle] = useState("")

  // Casters & Sponsors local arrays
  const [casters, setCasters] = useState<Caster[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])

  // Temp form states for adding items
  const [newCasterName, setNewCasterName] = useState("")
  const [newCasterRole, setNewCasterRole] = useState("")
  const [newCasterPhoto, setNewCasterPhoto] = useState("")

  const [newSponsorName, setNewSponsorName] = useState("")
  const [newSponsorLogo, setNewSponsorLogo] = useState("")

  const [hasSynced, setHasSynced] = useState(false)

  // Sync state once the SWR config is loaded
  if (config && !hasSynced) {
    setTournamentTitle(config.tournamentTitle || "")
    setScrimTitle(config.scrimTitle || "")
    setMatchRound(config.matchRound || "")
    setMapName(config.mapName || "Erangel")
    setCountdownMinutes(config.countdownMinutes || 5)
    setShowCountdown(config.showCountdown ?? true)
    setStreamTitle(config.streamTitle || "")
    setCasters(config.casters || [])
    setSponsors(config.sponsors || [])
    setHasSynced(true)
  }

  // Handle saving core intro screen configs
  const handleSaveInfo = async () => {
    await updateConfig({
      tournamentTitle,
      scrimTitle,
      matchRound,
      mapName,
      countdownMinutes,
      showCountdown,
      streamTitle,
      casters,
      sponsors,
    })
  }

  // Add caster to list
  const handleAddCaster = () => {
    if (!newCasterName) return
    const newCaster: Caster = {
      id: `caster-${Date.now()}`,
      name: newCasterName,
      role: newCasterRole || "Commentator",
      photo: newCasterPhoto || "",
    }
    const updated = [...casters, newCaster]
    setCasters(updated)
    updateConfig({ casters: updated })
    
    // Clear inputs
    setNewCasterName("")
    setNewCasterRole("")
    setNewCasterPhoto("")
  }

  // Remove caster from list
  const handleRemoveCaster = (id: string) => {
    const updated = casters.filter((c) => c.id !== id)
    setCasters(updated)
    updateConfig({ casters: updated })
  }

  // Add sponsor to list
  const handleAddSponsor = () => {
    if (!newSponsorName) return
    const newSponsor: Sponsor = {
      id: `sponsor-${Date.now()}`,
      name: newSponsorName,
      logoUrl: newSponsorLogo || "",
    }
    const updated = [...sponsors, newSponsor]
    setSponsors(updated)
    updateConfig({ sponsors: updated })

    // Clear inputs
    setNewSponsorName("")
    setNewSponsorLogo("")
  }

  // Remove sponsor from list
  const handleRemoveSponsor = (id: string) => {
    const updated = sponsors.filter((s) => s.id !== id)
    setSponsors(updated)
    updateConfig({ sponsors: updated })
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Broadcast Intro Setup</h1>
          <p className="text-muted-foreground">Manage casters, countdown timers, scrim titles, and sponsor banners for the stream starting screen</p>
        </div>
        <Button onClick={handleSaveInfo} className="bg-gold hover:bg-gold/90 text-primary-foreground font-black tracking-wide px-6 py-2 shadow-lg shadow-gold/20">
          Sync & Save Screen
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Screen Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Intro & Scrim Info</CardTitle>
              <CardDescription>Configure matches titles, map parameters and titles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Tournament Title</label>
                  <Input
                    value={tournamentTitle}
                    onChange={(e) => setTournamentTitle(e.target.value)}
                    placeholder="E.g., PUBG MOBILE CHAMPIONSHIP"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Scrim Title (Sub-header)</label>
                  <Input
                    value={scrimTitle}
                    onChange={(e) => setScrimTitle(e.target.value)}
                    placeholder="E.g., PRO SCRIMS - MATCH 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Match Round</label>
                  <Input
                    value={matchRound}
                    onChange={(e) => setMatchRound(e.target.value)}
                    placeholder="E.g., ROUND 1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Map Name</label>
                  <select
                    value={mapName}
                    onChange={(e) => setMapName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-border bg-input text-foreground text-sm font-medium focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    {MAPS.map((map) => (
                      <option key={map} value={map}>{map}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Timer Header</label>
                  <Input
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    placeholder="E.g., STREAM STARTING SOON"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/50 items-center">
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Countdown Time (Minutes)</label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={countdownMinutes}
                    onChange={(e) => setCountdownMinutes(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold block">Enable Countdown Clock</span>
                    <span className="text-xs text-muted-foreground">Toggles the digital countdown circle</span>
                  </div>
                  <Switch
                    checked={showCountdown}
                    onCheckedChange={(checked) => setShowCountdown(checked)}
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Sponsors Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Sponsors & Partners</CardTitle>
              <CardDescription>Add and manage official sponsor logos for the bottom scroll ticker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-secondary/30 border border-border/50 rounded-lg">
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Sponsor Name</label>
                  <Input
                    value={newSponsorName}
                    onChange={(e) => setNewSponsorName(e.target.value)}
                    placeholder="E.g., Intel Core"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Sponsor Logo URL</label>
                  <div className="flex gap-2">
                    <Input
                      value={newSponsorLogo}
                      onChange={(e) => setNewSponsorLogo(e.target.value)}
                      placeholder="Paste Image URL"
                    />
                    <Button onClick={handleAddSponsor} className="bg-gold hover:bg-gold/90 text-primary-foreground font-bold shrink-0">
                      Add Sponsor
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sponsors List */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="relative flex flex-col items-center justify-between p-3 border border-border/80 rounded-xl bg-card">
                    {sponsor.logoUrl ? (
                      <img src={sponsor.logoUrl} alt={sponsor.name} className="h-8 object-contain" />
                    ) : (
                      <div className="text-xs font-bold text-center uppercase tracking-widest text-gold">{sponsor.name}</div>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-2 block truncate max-w-full font-bold">{sponsor.name}</span>
                    <button
                      onClick={() => handleRemoveSponsor(sponsor.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs font-bold shadow hover:bg-destructive/90"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Casters Manager Side Column */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Casters Presentation</CardTitle>
              <CardDescription>Add commentators to show in the caster introduction cards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 p-3 bg-secondary/30 border border-border/50 rounded-lg">
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Caster Name</label>
                  <Input
                    value={newCasterName}
                    onChange={(e) => setNewCasterName(e.target.value)}
                    placeholder="E.g., John Smith"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Role / Subtitle</label>
                  <Input
                    value={newCasterRole}
                    onChange={(e) => setNewCasterRole(e.target.value)}
                    placeholder="E.g., Lead Commentator"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Photo / Avatar URL</label>
                  <Input
                    value={newCasterPhoto}
                    onChange={(e) => setNewCasterPhoto(e.target.value)}
                    placeholder="Paste Image URL"
                  />
                </div>
                <Button onClick={handleAddCaster} className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-bold mt-2">
                  Add Caster
                </Button>
              </div>

              {/* Casters List */}
              <div className="space-y-3 mt-4">
                {casters.map((caster) => (
                  <div key={caster.id} className="relative flex gap-3 items-center p-3 border border-border rounded-xl bg-card/60">
                    <div className="w-10 h-10 rounded bg-white/5 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                      {caster.photo ? (
                        <img src={caster.photo} alt={caster.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm truncate uppercase tracking-wide">{caster.name}</h4>
                      <p className="text-[10px] text-gold font-bold truncate uppercase">{caster.role}</p>
                    </div>
                    <Button
                      onClick={() => handleRemoveCaster(caster.id)}
                      variant="destructive"
                      size="sm"
                      className="h-7 px-2"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
