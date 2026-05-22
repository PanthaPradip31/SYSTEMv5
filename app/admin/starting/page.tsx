"use client"

import { useState } from "react"
import { useIntroConfig } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { MAPS, Caster, Sponsor } from "@/lib/types"
import { compressBase64Image } from "@/lib/utils"

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
  const [newCasterInstagram, setNewCasterInstagram] = useState("")
  const [newCasterTwitter, setNewCasterTwitter] = useState("")

  const [newSponsorName, setNewSponsorName] = useState("")
  const [newSponsorLogo, setNewSponsorLogo] = useState("")
  const [newSponsorVideo, setNewSponsorVideo] = useState("")
  const [newSponsorMediaType, setNewSponsorMediaType] = useState<"image" | "video">("image")
  const [isReadingFile, setIsReadingFile] = useState(false)

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
  const handleCasterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsReadingFile(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string
      const compressed = await compressBase64Image(dataUrl)
      setNewCasterPhoto(compressed)
      setIsReadingFile(false)
    }
    reader.readAsDataURL(file)
  }

  const handleAddCaster = () => {
    if (!newCasterName) return
    const newCaster: Caster = {
      id: `caster-${Date.now()}`,
      name: newCasterName,
      role: newCasterRole || "Commentator",
      photo: newCasterPhoto || "",
      instagram: newCasterInstagram || "",
      twitter: newCasterTwitter || "",
    }
    const updated = [...casters, newCaster]
    setCasters(updated)
    updateConfig({ casters: updated })
    
    // Clear inputs
    setNewCasterName("")
    setNewCasterRole("")
    setNewCasterPhoto("")
    setNewCasterInstagram("")
    setNewCasterTwitter("")
  }

  // Remove caster from list
  const handleRemoveCaster = (id: string) => {
    const updated = casters.filter((c) => c.id !== id)
    setCasters(updated)
    updateConfig({ casters: updated })
  }

  // Read local file (image or video) and convert to Data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsReadingFile(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (file.type.startsWith("video/")) {
        setNewSponsorVideo(dataUrl)
        setNewSponsorMediaType("video")
      } else {
        setNewSponsorLogo(dataUrl)
        setNewSponsorMediaType("image")
      }
      setIsReadingFile(false)
    }
    reader.onerror = () => {
      setIsReadingFile(false)
    }
    reader.readAsDataURL(file)
  }

  // Add sponsor to list
  const handleAddSponsor = () => {
    if (!newSponsorName) return
    const newSponsor: Sponsor = {
      id: `sponsor-${Date.now()}`,
      name: newSponsorName,
      logoUrl: newSponsorMediaType === "image" ? newSponsorLogo || "" : undefined,
      videoUrl: newSponsorMediaType === "video" ? newSponsorVideo || "" : undefined,
      mediaType: newSponsorMediaType,
    }
    const updated = [...sponsors, newSponsor]
    setSponsors(updated)
    updateConfig({ sponsors: updated })

    // Clear inputs
    setNewSponsorName("")
    setNewSponsorLogo("")
    setNewSponsorVideo("")
    setNewSponsorMediaType("image")
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
              <CardDescription>Add and manage official sponsor logos or video advertisements for the bottom scroll ticker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 p-4 bg-secondary/30 border border-border/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Sponsor Name</label>
                    <Input
                      value={newSponsorName}
                      onChange={(e) => setNewSponsorName(e.target.value)}
                      placeholder="E.g., Intel Core"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Media Type</label>
                    <select
                      value={newSponsorMediaType}
                      onChange={(e) => setNewSponsorMediaType(e.target.value as "image" | "video")}
                      className="w-full h-10 px-3 rounded-md border border-border bg-input text-foreground text-sm font-medium focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                      <option value="image">Image Logo</option>
                      <option value="video">Video Commercial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/30">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                      Upload File {isReadingFile && " (Processing...)"}
                    </label>
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="cursor-pointer file:text-gold file:font-bold file:bg-transparent file:border-0"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Recommended: Transparent PNG (Images) or light WebM/MP4 (Videos).
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                      Or Paste {newSponsorMediaType === "image" ? "Image Logo" : "Video"} URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={newSponsorMediaType === "image" ? newSponsorLogo : newSponsorVideo}
                        onChange={(e) => {
                          if (newSponsorMediaType === "image") {
                            setNewSponsorLogo(e.target.value)
                          } else {
                            setNewSponsorVideo(e.target.value)
                          }
                        }}
                        placeholder={newSponsorMediaType === "image" ? "Paste Image URL" : "Paste Video URL"}
                      />
                      <Button
                        onClick={handleAddSponsor}
                        disabled={isReadingFile || !newSponsorName}
                        className="bg-gold hover:bg-gold/90 text-primary-foreground font-bold shrink-0"
                      >
                        Add Sponsor
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sponsors List */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="relative flex flex-col items-center justify-between p-3 border border-border/80 rounded-xl bg-card">
                    <div className="w-full h-14 flex items-center justify-center overflow-hidden bg-black/20 rounded-lg p-1">
                      {sponsor.mediaType === "video" && sponsor.videoUrl ? (
                        <video src={sponsor.videoUrl} autoPlay loop muted playsInline className="h-12 object-contain rounded-md" />
                      ) : sponsor.logoUrl ? (
                        <img src={sponsor.logoUrl} alt={sponsor.name} className="h-12 object-contain rounded-md" />
                      ) : (
                        <div className="text-xs font-bold text-center uppercase tracking-widest text-gold">{sponsor.name}</div>
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-2 block truncate max-w-full font-bold uppercase tracking-widest">
                      {sponsor.name} ({sponsor.mediaType || "image"})
                    </span>
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
                
                {/* Photo Selection with local file upload */}
                <div className="space-y-2 border-t border-border/20 pt-2">
                  <label className="text-xs text-muted-foreground uppercase font-bold block">Caster Avatar Image</label>
                  <div className="flex items-center gap-3 bg-black/10 p-2.5 rounded-lg border border-white/5">
                    <div className="w-12 h-12 rounded border border-white/10 bg-black/40 flex items-center justify-center overflow-hidden shrink-0">
                      {newCasterPhoto ? (
                        <img src={newCasterPhoto} alt="Caster preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] text-muted-foreground uppercase font-bold text-center leading-none">No Photo</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Input
                        value={newCasterPhoto}
                        onChange={(e) => setNewCasterPhoto(e.target.value)}
                        placeholder="Or Paste Image URL"
                        className="h-7 text-[10px] rounded"
                      />
                      <label className="inline-block cursor-pointer w-full">
                        <Button variant="outline" size="sm" asChild className="h-6 text-[10px] w-full border-white/10 bg-zinc-900/60 hover:bg-gold/10 hover:text-gold transition-colors">
                          <span>📁 Upload Local Avatar</span>
                        </Button>
                        <input type="file" accept="image/*" className="hidden" onChange={handleCasterFileChange} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Social Handles Inputs */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/20">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Instagram</label>
                    <Input
                      value={newCasterInstagram}
                      onChange={(e) => setNewCasterInstagram(e.target.value)}
                      placeholder="e.g. caster_name"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Twitter</label>
                    <Input
                      value={newCasterTwitter}
                      onChange={(e) => setNewCasterTwitter(e.target.value)}
                      placeholder="e.g. caster_tweets"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <Button onClick={handleAddCaster} className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-bold mt-2">
                  Add Caster
                </Button>
              </div>

              {/* Casters List */}
              <div className="space-y-3 mt-4">
                {casters.map((caster) => (
                  <div key={caster.id} className="relative flex gap-3 items-center p-3 border border-border rounded-xl bg-card/60">
                    <div className="w-12 h-12 rounded bg-white/5 border border-border flex items-center justify-center shrink-0 overflow-hidden">
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
                      <div className="flex gap-2 mt-1 text-[9px] font-mono text-muted-foreground flex-wrap">
                        {caster.instagram && (
                          <span className="flex items-center gap-0.5 text-pink-400">
                            📸 @{caster.instagram}
                          </span>
                        )}
                        {caster.twitter && (
                          <span className="flex items-center gap-0.5 text-sky-400">
                            🐦 @{caster.twitter}
                          </span>
                        )}
                      </div>
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
