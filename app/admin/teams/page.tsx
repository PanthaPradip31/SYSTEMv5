"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useTeams, SAMPLE_TEAMS } from "@/lib/store"
import type { Team, Player } from "@/lib/types"
import { cn, compressBase64Image, isValidImage } from "@/lib/utils"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

const PRESET_COLORS = [
  { value: "#F1C40F", label: "Golden Valor", glow: "rgba(241,196,15,0.4)" },
  { value: "#FF3F34", label: "Crimson Rage", glow: "rgba(255,63,52,0.4)" },
  { value: "#00D2D3", label: "Neon Frost", glow: "rgba(0,210,211,0.4)" },
  { value: "#10AC84", label: "Viper Toxic", glow: "rgba(16,172,132,0.4)" },
  { value: "#9B59B6", label: "Electric Void", glow: "rgba(155,89,182,0.4)" },
  { value: "#FF9F43", label: "Solar Flare", glow: "rgba(255,159,67,0.4)" },
  { value: "#FF7675", label: "Sakura Blade", glow: "rgba(255,118,117,0.4)" },
  { value: "#7F8C8D", label: "Shadow Metal", glow: "rgba(127,140,141,0.4)" }
]

function getRandomColor() {
  return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)].value
}

const MIN_TEAMS = 16
const MAX_TEAMS = 25

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const { teams, isLoading, addTeam, addTeamsBulk, updateTeam, removeTeam, removeTeamsBulk } = useTeams()

  // Automatically prune the lobby to exactly MAX_TEAMS teams in the background if it exceeds the limit!
  useEffect(() => {
    if (teams && teams.length > MAX_TEAMS) {
      const extraTeams = teams.slice(MAX_TEAMS)
      removeTeamsBulk(extraTeams.map(t => t.id))
    }
  }, [teams, removeTeamsBulk])

  // Form state
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamShortName, setNewTeamShortName] = useState("")
  const [newTeamLogo, setNewTeamLogo] = useState("")
  const [newTeamLogoPreview, setNewTeamLogoPreview] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState("#F1C40F")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  // 6 editable player name slots in the form (4 active + 2 sub)
  const [newPlayerNames, setNewPlayerNames] = useState(["Player 1", "Player 2", "Player 3", "Player 4", "Player 5 (Sub)", "Player 6 (Sub)"])
  const [newPlayerPhotos, setNewPlayerPhotos] = useState<string[]>(["", "", "", "", "", ""])

  const handleNewTeamFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const result = reader.result as string
      const compressed = await compressBase64Image(result)
      setNewTeamLogoPreview(compressed)
      setNewTeamLogo(compressed)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleAddTeam = () => {
    if (teams.length >= MAX_TEAMS) {
      setErrorMsg(`SLOT FULL: Maximum tournament limit of ${MAX_TEAMS} teams exceeded!`)
      return
    }
    if (!newTeamName || !newTeamShortName) return
    setErrorMsg(null)
    const teamId = genId("team")
    const resolvedLogo =
      newTeamLogo.trim() ||
      `/placeholder.svg?height=64&width=64&query=${encodeURIComponent(newTeamName)} esports logo`

    const players: Player[] = newPlayerNames.map((name, i) => {
      const finalName = name || `Player ${i + 1}`
      return {
        id: genId("p"),
        name: finalName,
        teamId,
        status: "alive",
        kills: 0,
        damage: 0,
        isSub: i >= 4, // 5th and 6th slots are subs
        photo: newPlayerPhotos[i] || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(finalName)}`,
      }
    })

    addTeam({ id: teamId, name: newTeamName, shortName: newTeamShortName.toUpperCase().slice(0, 4), logo: resolvedLogo, color: selectedColor, players })
    setNewTeamName("")
    setNewTeamShortName("")
    setNewTeamLogo("")
    setNewTeamLogoPreview(null)
    setNewPlayerNames(["Player 1", "Player 2", "Player 3", "Player 4", "Player 5 (Sub)", "Player 6 (Sub)"])
    setNewPlayerPhotos(["", "", "", "", "", ""])
  }

  const handleLoadSampleTeams = async () => {
    if (teams.length >= MAX_TEAMS) {
      setErrorMsg(`SLOT FULL: Maximum tournament limit of ${MAX_TEAMS} teams has been reached!`)
      return
    }
    setErrorMsg(null)
    const teamsToLoad: Team[] = []
    const availableSlots = MAX_TEAMS - teams.length

    if (teams.length === 0) {
      // Shuffle and pick exactly MAX_TEAMS random teams from the sample roster
      const selectedTeams = [...SAMPLE_TEAMS]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(MAX_TEAMS, availableSlots))

      selectedTeams.forEach((team) => {
        // ensure sample teams always have 6 players
        const players = team.players.length >= 6 ? team.players : [
          ...team.players.slice(0, 4),
          ...Array.from({ length: 6 - Math.min(team.players.length, 4) }, (_, i) => ({
            id: genId("p"),
            name: `Player ${team.players.length + i + 1}${team.players.length + i >= 4 ? " (Sub)" : ""}`,
            teamId: team.id,
            status: "alive" as const,
            kills: 0,
            damage: 0,
            isSub: true,
          })),
        ]
        teamsToLoad.push({ ...team, players })
      })
    } else {
      const existingIds = new Set(teams.map((t) => t.id))
      // Filter out existing and select up to available missing ones
      const missing = SAMPLE_TEAMS.filter((team) => !existingIds.has(team.id))
      const selectedTeams = [...missing]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(MAX_TEAMS, availableSlots))

      selectedTeams.forEach((team) => {
        const players = team.players.length >= 6 ? team.players : [
          ...team.players.slice(0, 4),
          ...Array.from({ length: 6 - Math.min(team.players.length, 4) }, (_, i) => ({
            id: genId("p"),
            name: `Player ${team.players.length + i + 1}${team.players.length + i >= 4 ? " (Sub)" : ""}`,
            teamId: team.id,
            status: "alive" as const,
            kills: 0,
            damage: 0,
            isSub: true,
          })),
        ]
        teamsToLoad.push({ ...team, players })
      })
    }

    if (teamsToLoad.length > 0) {
      await addTeamsBulk(teamsToLoad)
    }
  }

  const handlePruneLobby = async () => {
    setErrorMsg(null)
    const extraTeams = teams.slice(MAX_TEAMS)
    await removeTeamsBulk(extraTeams.map(t => t.id))
  }

  const handleClearAllTeams = async () => {
    if (!window.confirm("Clear all teams and rosters? This will remove every deployed team permanently.")) {
      return
    }
    setErrorMsg(null)
    await removeTeamsBulk(teams.map((t) => t.id))
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
            TEAM ROSTER MANAGEMENT
          </h1>
          <p className="text-sm text-muted-foreground/80 mt-1">
            Register and deploy competitive esports teams in the live tournament engine.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          {teams.length > MAX_TEAMS && (
            <Button 
              onClick={handlePruneLobby} 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/20"
            >
              🧹 Prune Lobby to 25
            </Button>
          )}
          {teams.length > 0 && (
            <Button
              onClick={handleClearAllTeams}
              variant="destructive"
              className="bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/20"
            >
              🗑️ Clear All Teams & Rosters
            </Button>
          )}
          <Button 
            onClick={handleLoadSampleTeams} 
            variant="outline" 
            disabled={teams.length >= MAX_TEAMS}
            className="border-gold/30 hover:border-gold/80 hover:bg-gold/10 text-gold transition-all duration-300 gap-1.5 shrink-0"
          >
            🎮 Load Roster Presets (25 Teams)
          </Button>
        </div>
      </div>

      {/* ── Slot Allocation HUD ── */}
      <div className="bg-zinc-900/60 backdrop-blur-md border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.4)] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 text-center md:text-left flex-1 w-full z-10">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider text-xs">
              ⚡ Live Tournament Slot Allocation HUD
            </span>
            <span className={cn(
              "font-mono font-bold px-2.5 py-0.5 rounded text-xs tracking-wide shadow-xs border",
              teams.length >= MAX_TEAMS 
                ? "bg-red-500/10 text-red-400 border-red-500/20" 
                : "bg-gold/10 text-gold border-gold/20"
            )}>
              {teams.length} / 25 SLOTS ACTIVE
            </span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/5 p-0.5 mt-2">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                teams.length >= MAX_TEAMS 
                  ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]" 
                  : teams.length >= MIN_TEAMS 
                    ? "bg-linear-to-r from-amber-500 to-emerald-500" 
                    : "bg-linear-to-r from-gold to-orange-500"
              )}
              style={{ width: `${Math.min(100, (teams.length / MAX_TEAMS) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground/80 pt-1 tracking-wide uppercase font-medium">
            {teams.length < 16 
              ? `⚠️ MINIMUM CRITICAL CAP NOT REACHED: Esports lobby requires at least 16 teams (Deploy ${16 - teams.length} more).`
              : teams.length >= MAX_TEAMS 
                ? `🔴 SLOTS EXCEEDED: MAXIMUM COMPETITIVE MATCH LIMIT OF ${MAX_TEAMS} TEAMS DEPLOYED!`
                : `✅ STABLE LOBBY CONFIGURATION: Optimal lobby size reached (${MIN_TEAMS} to ${MAX_TEAMS} active teams).`
            }
          </p>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl p-4 text-xs flex items-center justify-between animate-shake">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🚨</span>
            <span className="font-semibold tracking-wide uppercase">{errorMsg}</span>
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-[10px] text-red-200 hover:bg-red-500/20 px-2 rounded-lg" onClick={() => setErrorMsg(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* ── Add Team Form / Command Center ── */}
      <Card className="bg-zinc-950/40 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl overflow-hidden">
        <div className="h-[2px] bg-linear-to-r from-transparent via-gold to-transparent" />
        <CardHeader className="pb-3 border-b border-border/10">
          <CardTitle className="text-base uppercase tracking-wider text-neutral-200 font-bold">
            ⚔️ Deploy Roster Command Bridge
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Inputs (Identity & Colors) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Team Brand Name</label>
                  <Input 
                    placeholder="e.g. Natus Vincere" 
                    value={newTeamName} 
                    onChange={(e) => setNewTeamName(e.target.value)} 
                    className="bg-black/20 border-white/5 focus:border-gold/50 h-10 mt-1 text-sm rounded-lg" 
                    disabled={teams.length >= MAX_TEAMS} 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Lobby Tag (Max 4 Characters)</label>
                  <Input 
                    placeholder="e.g. NAVI" 
                    value={newTeamShortName} 
                    onChange={(e) => setNewTeamShortName(e.target.value)} 
                    className="bg-black/20 border-white/5 focus:border-gold/50 h-10 mt-1 text-sm font-mono tracking-widest uppercase rounded-lg" 
                    maxLength={10} 
                    disabled={teams.length >= MAX_TEAMS} 
                  />
                </div>
              </div>

              {/* Logo Select */}
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Team Crest / Logo</label>
                <div className="flex items-center gap-4 bg-black/10 p-3 rounded-xl border border-white/5">
                  <div className="w-16 h-16 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group">
                    {newTeamLogoPreview && isValidImage(newTeamLogoPreview) ? (
                      <img src={newTeamLogoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-[9px] text-muted-foreground/60 text-center leading-tight uppercase font-bold">No Crest</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input 
                      placeholder="Paste Image URL..." 
                      value={newTeamLogo} 
                      onChange={(e) => { setNewTeamLogo(e.target.value); setNewTeamLogoPreview(e.target.value.trim() || null) }} 
                      className="bg-black/20 border-white/5 focus:border-gold/50 h-8 text-xs rounded-md" 
                      disabled={teams.length >= MAX_TEAMS} 
                    />
                    <label className={cn("inline-block cursor-pointer w-full", teams.length >= MAX_TEAMS && "pointer-events-none opacity-40")}>
                      <Button variant="outline" size="sm" asChild disabled={teams.length >= MAX_TEAMS} className="h-7 text-xs w-full border-white/10 bg-zinc-900/60 hover:bg-gold/10 hover:text-gold transition-colors">
                        <span>📁 Upload Local File</span>
                      </Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handleNewTeamFileChange} disabled={teams.length >= MAX_TEAMS} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Custom Presets Color Picker */}
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Esports Team Theme Color</label>
                <div className="grid grid-cols-8 gap-2 bg-black/10 p-3 rounded-xl border border-white/5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setSelectedColor(c.value)}
                      disabled={teams.length >= MAX_TEAMS}
                      className={cn(
                        "w-7 h-7 rounded-full transition-all duration-300 relative shrink-0",
                        teams.length >= MAX_TEAMS && "opacity-30 cursor-not-allowed"
                      )}
                      style={{ 
                        backgroundColor: c.value, 
                        boxShadow: selectedColor === c.value ? `0 0 14px ${c.value}` : "none",
                        transform: selectedColor === c.value ? "scale(1.15)" : "scale(1)"
                      }}
                      title={c.label}
                    >
                      {selectedColor === c.value && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleAddTeam} 
                disabled={teams.length >= MAX_TEAMS || !newTeamName || !newTeamShortName}
                className="w-full h-11 gradient-gold text-primary-foreground font-bold tracking-wider uppercase rounded-xl transition-all duration-300 shadow-lg hover:shadow-gold/20"
              >
                🚀 Deploy Team To Lobby
              </Button>
            </div>

            {/* Right Tactical Squad Forming */}
            <div className="lg:col-span-7 space-y-4">
              <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                TEAM ROSTER BATTLE FORMATION (4 ACTIVE + 2 SUBS)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {newPlayerNames.map((name, i) => {
                  const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || `Player ${i + 1}`)}`
                  const currentPhoto = isValidImage(newPlayerPhotos[i]) ? newPlayerPhotos[i]! : defaultAvatar

                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "relative border p-3 rounded-xl flex flex-col items-center gap-3 transition-all duration-300 bg-black/10 backdrop-blur-xs",
                        i >= 4 
                          ? "border-dashed border-yellow-500/20 hover:border-yellow-500/40" 
                          : "border-white/5"
                      )}
                      style={{ 
                        borderColor: i < 4 && selectedColor ? `${selectedColor}15` : undefined,
                        boxShadow: i < 4 && selectedColor === selectedColor ? `0 0 10px ${selectedColor}05` : undefined
                      }}
                    >
                      {/* Sub Badge */}
                      <span className={cn(
                        "absolute top-2 right-2 text-[8px] font-black px-1 py-0.5 rounded leading-none tracking-wide",
                        i >= 4 ? "bg-yellow-500/20 text-yellow-400" : "bg-neutral-800 text-neutral-400"
                      )}>
                        {i >= 4 ? "SUB" : "ACT"}
                      </span>

                      {/* Photo Avatar circle with uploader overlay */}
                      <div 
                        className="relative w-16 h-16 rounded-full overflow-hidden border bg-zinc-950 flex items-center justify-center group shrink-0 transition-transform duration-300 hover:scale-105"
                        style={{ borderColor: i < 4 ? selectedColor : "#F1C40F40" }}
                      >
                        <img src={currentPhoto} alt={`Player ${i + 1}`} className="w-full h-full object-contain" />
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center">
                          <span className="text-[9px] text-white font-black uppercase tracking-wider leading-none">Photo</span>
                          <span className="text-[7px] text-neutral-400 mt-1">Upload</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const reader = new FileReader()
                              reader.onload = async () => {
                                const compressed = await compressBase64Image(reader.result as string)
                                const updated = [...newPlayerPhotos]
                                updated[i] = compressed
                                setNewPlayerPhotos(updated)
                              }
                              reader.readAsDataURL(file)
                              e.target.value = ""
                            }} 
                          />
                        </label>
                      </div>

                      {/* Input player name */}
                      <div className="w-full space-y-1">
                        <Input
                          value={name}
                          onChange={(e) => {
                            const updated = [...newPlayerNames]
                            updated[i] = e.target.value
                            setNewPlayerNames(updated)
                          }}
                          placeholder={i >= 4 ? "Sub Name" : `Player ${i + 1}`}
                          className={cn(
                            "h-7 text-xs px-1.5 text-center font-semibold bg-black/20 focus:bg-black/40 border-white/5",
                            i >= 4 && "border-yellow-500/20 focus:border-yellow-500/40 font-mono"
                          )}
                        />
                        <p className={cn("text-[9px] text-center font-bold tracking-wider uppercase", i >= 4 ? "text-yellow-500/70" : "text-muted-foreground/60")}>
                          {i >= 4 ? `Sub Roster ${i - 3}` : `Combatant P${i + 1}`}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Teams Grid Title ── */}
      <div className="pt-4 flex items-center justify-between border-b border-border/10 pb-3">
        <h2 className="text-lg font-extrabold tracking-wider uppercase text-neutral-200 flex items-center gap-2">
          🏆 Deployed Lobby combatants ({teams.length})
        </h2>
        {teams.length > 0 && (
          <p className="text-xs text-muted-foreground font-mono">LOBBY SIZE STABILITY: {(teams.length / MAX_TEAMS * 100).toFixed(0)}%</p>
        )}
      </div>

      {/* ── Teams Grid ── */}
      {!isLoading && teams.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} updateTeam={updateTeam} removeTeam={removeTeam} />
          ))}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-16 bg-white/10 rounded" />
                  <div className="h-4 w-32 bg-white/5 rounded" />
                </div>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="space-y-2.5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-3 w-24 bg-white/5 rounded" />
                    <div className="w-4 h-4 rounded-full bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/5 bg-zinc-950/20 rounded-2xl backdrop-blur-xs flex flex-col items-center justify-center p-6 space-y-4 animate-fade-in">
          <span className="text-4xl">🛸</span>
          <div>
            <h3 className="font-extrabold text-neutral-300 uppercase tracking-wide">No Teams Deployed Yet</h3>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm">No combatant rosters are registered in the current database. Load presets or manually deploy teams above.</p>
          </div>
          <Button 
            onClick={handleLoadSampleTeams} 
            className="gradient-gold text-primary-foreground font-bold tracking-wider uppercase rounded-lg px-6 hover:shadow-gold/10 transition-shadow"
          >
            🎮 Deploy presets (25 Teams)
          </Button>
        </div>
      ) : null}
    </div>
  )
}

// ─── Team Card Component ──────────────────────────────────────────────────────

function TeamCard({
  team,
  updateTeam,
  removeTeam,
}: {
  team: Team
  updateTeam: (id: string, updates: Partial<Team>) => void
  removeTeam: (id: string) => void
}) {
  const [logoUrlInput, setLogoUrlInput] = useState("")
  const [editingLogo, setEditingLogo] = useState(false)
  const [urlPreview, setUrlPreview] = useState<string | null>(null)
  const [editingPlayers, setEditingPlayers] = useState(false)
  const [playerDraft, setPlayerDraft] = useState<string[]>([])
  const [playerPhotoDraft, setPlayerPhotoDraft] = useState<string[]>([])

  const activePlayers = team.players.filter((p) => !p.isSub).slice(0, 4)
  const subPlayers = team.players.filter((p) => p.isSub)

  const ensureSixPlayers = (players: Player[]): Player[] => {
    const active = (players || []).filter((p) => !p.isSub)
    const subs = (players || []).filter((p) => p.isSub)

    const finalActive = [...active]
    while (finalActive.length < 4) {
      finalActive.push({
        id: genId("p"),
        name: `Combatant ${finalActive.length + 1}`,
        teamId: team.id,
        status: "alive" as const,
        kills: 0,
        damage: 0,
        isSub: false,
        photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=Combatant%20${encodeURIComponent(team.name)}%20${finalActive.length + 1}`
      })
    }
    const cleanActive = finalActive.slice(0, 4)

    const finalSubs = [...subs]
    while (finalSubs.length < 2) {
      finalSubs.push({
        id: genId("p"),
        name: `Sub ${finalSubs.length + 1}`,
        teamId: team.id,
        status: "alive" as const,
        kills: 0,
        damage: 0,
        isSub: true,
        photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=Sub%20${encodeURIComponent(team.name)}%20${finalSubs.length + 1}`
      })
    }
    const cleanSubs = finalSubs.slice(0, 2)

    return [...cleanActive, ...cleanSubs]
  }

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const compressed = await compressBase64Image(reader.result as string)
      updateTeam(team.id, { logo: compressed })
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleApplyUrl = () => {
    if (!logoUrlInput.trim()) return
    updateTeam(team.id, { logo: logoUrlInput.trim() })
    setLogoUrlInput("")
    setUrlPreview(null)
    setEditingLogo(false)
  }

  const startEditingPlayers = () => {
    const six = ensureSixPlayers(team.players)
    setPlayerDraft(six.map((p) => p.name))
    setPlayerPhotoDraft(six.map((p) => p.photo || ""))
    setEditingPlayers(true)
  }

  const savePlayerNames = async () => {
    const six = ensureSixPlayers(team.players)
    const updatedPlayersRaw = await Promise.all(
      six.map(async (p, i) => {
        const finalName = playerDraft[i]?.trim() || ""
        if (!finalName) return null

        const customPhoto = playerPhotoDraft[i]?.trim() || ""
        const resolvedPhoto = customPhoto.startsWith("data:image")
          ? await compressBase64Image(customPhoto)
          : customPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(finalName)}`
        return {
          ...p,
          name: finalName,
          photo: resolvedPhoto,
          isSub: i >= 4,
        }
      })
    )
    const updated = updatedPlayersRaw.filter(Boolean) as Player[]
    updateTeam(team.id, { players: updated })
    setEditingPlayers(false)
  }

  return (
    <Card 
      className="bg-zinc-950/20 backdrop-blur-md border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-white/10 group relative flex flex-col"
      style={{
        boxShadow: team.color ? `0 4px 20px -8px ${team.color}25` : undefined
      }}
    >
      {/* Dynamic Colored Roster Frame Line */}
      <div className="h-[3px] w-full transition-all duration-300" style={{ backgroundColor: team.color || "#F1C40F" }} />

      <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header Team Logo & Badge Details */}
          <div className="flex items-start justify-between gap-3 relative">
            <div className="flex items-center gap-3">
              <div 
                className="relative w-12 h-12 rounded-xl overflow-hidden border bg-zinc-950 flex items-center justify-center p-1 shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{ borderColor: team.color ? `${team.color}40` : "#white/10" }}
              >
                <img
                  src={urlPreview && isValidImage(urlPreview) ? urlPreview : (isValidImage(team.logo) ? team.logo! : "/placeholder.svg")}
                  alt={`${team.name} logo`}
                  className="w-full h-full object-contain"
                />
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-[7px] text-white font-black uppercase tracking-widest">Edit</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
                </label>
              </div>
              <div className="truncate">
                <span className="text-xs font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-wider bg-black/40 border border-white/5" style={{ color: team.color }}>
                  {team.shortName}
                </span>
                <h3 className="font-extrabold text-sm text-neutral-200 mt-1.5 truncate group-hover:text-gold transition-colors">{team.name}</h3>
              </div>
            </div>

            {/* Remove Trashcan button */}
            <button 
              onClick={() => removeTeam(team.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all shrink-0 cursor-pointer"
              title="Remove Team"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>

          {/* Logo URL Input Panel */}
          {editingLogo ? (
            <div className="w-full flex gap-1.5 bg-black/20 p-1.5 rounded-lg border border-white/5 animate-slide-in-top">
              <Input 
                value={logoUrlInput} 
                onChange={(e) => { setLogoUrlInput(e.target.value); setUrlPreview(e.target.value.trim() || null) }} 
                placeholder="Paste URL..." 
                className="h-7 text-[10px] flex-1 bg-zinc-950 border-white/5" 
              />
              <Button size="sm" className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider" onClick={handleApplyUrl}>Apply</Button>
              <Button size="sm" variant="ghost" className="h-7 px-1.5 text-neutral-400" onClick={() => { setEditingLogo(false); setLogoUrlInput(""); setUrlPreview(null) }}>✕</Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" className="h-6 text-[9px] w-full border border-dashed border-white/5 text-muted-foreground hover:text-gold hover:bg-gold/5 transition-all uppercase tracking-widest font-bold" onClick={() => setEditingLogo(true)}>
              🔗 Set Logo URL
            </Button>
          )}

          <div className="border-t border-white/5 my-2" />

          {/* ── Player Roster Display ── */}
          {editingPlayers ? (
            <div className="space-y-2 bg-black/10 p-2.5 rounded-xl border border-white/5 animate-fade-in">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-extrabold mb-1 text-center">Roster Configuration</p>
              {playerDraft.map((name, i) => (
                <div key={i} className="flex flex-col gap-1 border-b border-white/5 pb-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-[9px] w-8 shrink-0 font-extrabold uppercase font-mono text-center tracking-wider px-1 py-0.5 rounded", i >= 4 ? "bg-yellow-500/25 text-yellow-400" : "bg-neutral-800 text-neutral-400")}>
                      {i >= 4 ? "SUB" : `ACT`}
                    </span>
                    <Input
                      value={name}
                      onChange={(e) => { const d = [...playerDraft]; d[i] = e.target.value; setPlayerDraft(d) }}
                      className="h-6 text-[10px] flex-1 bg-zinc-950 border-white/5 font-semibold text-neutral-200"
                      placeholder="Name"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pl-9">
                    <Input
                      value={playerPhotoDraft[i] || ""}
                      onChange={(e) => { const p = [...playerPhotoDraft]; p[i] = e.target.value; setPlayerPhotoDraft(p) }}
                      className="h-5 text-[8px] flex-1 bg-zinc-950 border-white/5 text-muted-foreground font-mono"
                      placeholder="Photo URL (optional)"
                    />
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <div className="flex gap-1.5">
                  <Button size="sm" className="h-7 text-xs flex-1 uppercase tracking-wider font-bold" onClick={savePlayerNames}>Save Changes</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-neutral-400" onClick={() => setEditingPlayers(false)}>Cancel</Button>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="h-7 text-[10px] w-full bg-red-950/60 border border-red-500/20 text-red-400 hover:bg-red-900/60 font-bold uppercase tracking-wider" 
                  onClick={() => {
                    setPlayerDraft(["", "", "", "", "", ""])
                    setPlayerPhotoDraft(["", "", "", "", "", ""])
                  }}
                >
                  🧹 Clear/Wipe All Slots
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 bg-black/10 p-2.5 rounded-xl border border-white/5">
              {/* Active players */}
              <div className="space-y-1.5">
                {activePlayers.map((player) => (
                  <div key={player.id} className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <div className={cn("w-2 h-2 rounded-full shrink-0 relative",
                        player.status === "alive" && "bg-emerald-500 shadow-[0_0_8px_#10B981]",
                        player.status === "knocked" && "bg-amber-500 animate-pulse shadow-[0_0_8px_#F59E0B]",
                        player.status === "eliminated" && "bg-rose-500 shadow-[0_0_6px_#EF4444]",
                      )}>
                        {player.status === "knocked" && (
                          <span className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75" />
                        )}
                      </div>
                      <span className="truncate font-extrabold text-xs text-neutral-300 tracking-wide">{player.name}</span>
                    </div>
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center p-0.5 shrink-0">
                      <img
                        src={isValidImage(player.photo) ? player.photo! : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                        alt={player.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Substitute player(s) */}
              {subPlayers.length > 0 && (
                <div className="border-t border-white/5 pt-2 mt-2 space-y-1.5">
                  {subPlayers.map((player) => (
                    <div key={player.id} className="flex items-center gap-2 justify-between text-neutral-400">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[8px] font-black text-yellow-500/80 uppercase font-mono tracking-wider bg-yellow-500/10 px-1 py-0.5 rounded leading-none">SUB</span>
                        <span className="truncate text-xs font-semibold">{player.name}</span>
                      </div>
                      <div className="w-4 h-4 rounded-full overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center p-0.5 shrink-0">
                        <img
                          src={isValidImage(player.photo) ? player.photo! : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                          alt={player.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* If no sub slot yet, show a placeholder */}
              {subPlayers.length === 0 && (
                <div className="text-[9px] text-muted-foreground/30 italic border-t border-white/5 pt-1.5 mt-1.5 text-center uppercase tracking-wider font-bold">
                  Roster Incomplete (No Subs)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Roster Button Action */}
        {!editingPlayers && (
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full h-8 mt-3 border-white/10 hover:border-gold/50 hover:bg-gold/10 hover:text-gold transition-colors font-bold uppercase tracking-wider text-[10px]" 
            onClick={startEditingPlayers}
          >
            ✏️ Manage Team Roster
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
