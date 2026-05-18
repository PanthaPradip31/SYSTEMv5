"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTeams, useStandings } from "@/lib/store"
import { getRealtimeSync } from "@/lib/realtime"
import type { KillStreak, TeamWipe, ClutchMoment, ZonePhase, AirdropEvent, MVPData } from "@/lib/types"

export default function EffectsControlPage() {
  const { teams } = useTeams()
  const { standings } = useStandings()
  const [selectedTeam, setSelectedTeam] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [killStreakCount, setKillStreakCount] = useState(2)
  const [clutchSituation, setClutchSituation] = useState("1v4")
  const [zonePhase, setZonePhase] = useState(1)
  const [zoneTime, setZoneTime] = useState(120)
  const [hotDropLocation, setHotDropLocation] = useState("Pochinki")
  const [hotDropIntensity, setHotDropIntensity] = useState<"medium" | "high" | "extreme">("high")
  const [hotDropTeams, setHotDropTeams] = useState("")

  const selectedTeamData = teams.find((t) => t.id === selectedTeam)
  const selectedPlayerData = selectedTeamData?.players.find((p) => p.id === selectedPlayer)

  const triggerKillStreak = () => {
    if (!selectedPlayerData || !selectedTeamData) return

    const streakTypes = ["double", "triple", "quad", "rampage", "godlike"] as const
    const streakType = streakTypes[Math.min(killStreakCount - 2, 4)]

    const streak: KillStreak = {
      playerId: selectedPlayerData.id,
      playerName: selectedPlayerData.name,
      teamShortName: selectedTeamData.shortName,
      teamColor: selectedTeamData.color,
      count: killStreakCount,
      type: streakType,
    }

    getRealtimeSync()?.broadcast("KILL_STREAK", streak)
  }

  const triggerTeamWipe = () => {
    if (!selectedTeamData) return
    const randomWiper = teams[Math.floor(Math.random() * teams.length)]

    const wipe: TeamWipe = {
      id: `wipe-${Date.now()}`,
      wipedTeam: selectedTeamData.shortName,
      wipedTeamColor: selectedTeamData.color,
      wiperTeam: randomWiper.shortName,
      wiperTeamColor: randomWiper.color,
      timestamp: new Date(),
    }

    getRealtimeSync()?.broadcast("TEAM_WIPE", wipe)
  }

  const triggerClutch = (isActive: boolean) => {
    if (!selectedPlayerData || !selectedTeamData) return

    const clutch: ClutchMoment = {
      id: `clutch-${Date.now()}`,
      playerId: selectedPlayerData.id,
      playerName: selectedPlayerData.name,
      teamShortName: selectedTeamData.shortName,
      teamColor: selectedTeamData.color,
      situation: clutchSituation,
      isActive,
    }

    getRealtimeSync()?.broadcast("CLUTCH_MOMENT", clutch)
  }

  const triggerZoneUpdate = () => {
    const zone: ZonePhase = {
      phase: zonePhase,
      totalPhases: 9,
      timeRemaining: zoneTime,
      isClosing: zoneTime <= 30,
      isFinalCircle: zonePhase >= 8,
    }

    getRealtimeSync()?.broadcast("ZONE_UPDATE", zone)
  }

  const triggerAirdrop = () => {
    const airdrop: AirdropEvent = {
      id: `airdrop-${Date.now()}`,
      timestamp: new Date(),
      location: hotDropLocation,
    }

    getRealtimeSync()?.broadcast("AIRDROP", airdrop)
  }

  const triggerHotDrop = () => {
    const involvedTeams = hotDropTeams.trim()
      ? hotDropTeams.split(",").map((t) => t.trim()).filter(Boolean)
      : teams
          .sort(() => Math.random() - 0.5)
          .slice(0, 3 + Math.floor(Math.random() * 4))
          .map((t) => t.shortName)

    getRealtimeSync()?.broadcast("HOT_DROP", {
      location: hotDropLocation,
      teamsInvolved: involvedTeams,
      intensity: hotDropIntensity,
    })
  }

  const triggerMVP = () => {
    if (!selectedPlayerData || !selectedTeamData) return

    const mvp: MVPData = {
      playerId: selectedPlayerData.id,
      playerName: selectedPlayerData.name,
      teamShortName: selectedTeamData.shortName,
      teamLogo: selectedTeamData.logo,
      teamColor: selectedTeamData.color,
      kills: selectedPlayerData.kills || Math.floor(Math.random() * 8) + 3,
      damage: Math.floor(Math.random() * 800) + 400,
      survivalTime: `${Math.floor(Math.random() * 10) + 20}:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}`,
      isWWCD: Math.random() > 0.5,
      playerPhoto: selectedPlayerData.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedPlayerData.name)}`,
    }

    getRealtimeSync()?.broadcast("MVP_REVEAL", mvp)
  }

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

  const triggerWWCD = () => {
    if (!selectedTeamData) return

    const wwcdData = {
      teamId: selectedTeamData.id,
      teamName: selectedTeamData.name,
      teamShortName: selectedTeamData.shortName,
      teamLogo: selectedTeamData.logo,
      teamColor: selectedTeamData.color,
      totalKills: selectedTeamData.players.reduce((sum, p) => sum + p.kills, 0) || Math.floor(Math.random() * 15) + 5,
      totalPoints: Math.floor(Math.random() * 20) + 20,
    }

    getRealtimeSync()?.broadcast("WWCD_TRIGGER", wwcdData)
  }

  const triggerEpicElimination = () => {
    if (!selectedPlayerData || !selectedTeamData) return
    const randomVictim = teams
      .filter((t) => t.id !== selectedTeam)
      .flatMap((t) => t.players.map((p) => ({ ...p, team: t })))[Math.floor(Math.random() * 20)]

    if (!randomVictim) return

    getRealtimeSync()?.broadcast("ELIMINATION_EPIC", {
      id: `elim-${Date.now()}`,
      timestamp: new Date(),
      killerId: selectedPlayerData.id,
      killerName: selectedPlayerData.name,
      killerTeam: selectedTeamData.shortName,
      victimId: randomVictim.id,
      victimName: randomVictim.name,
      victimTeam: randomVictim.team.shortName,
      weapon: ["AWM", "M416", "AKM", "Kar98k", "Groza", "Pan"][Math.floor(Math.random() * 6)],
      isKnock: false,
    })
  }

  return (
    <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gold">Special Effects Control</h1>
          <p className="text-muted-foreground mt-1">Trigger cinematic overlay effects for your broadcast</p>
        </div>

        {/* Player/Team Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Player/Team</CardTitle>
            <CardDescription>Choose a player for player-specific effects</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label>Team</Label>
              <Select
                value={selectedTeam}
                onValueChange={(v) => {
                  setSelectedTeam(v)
                  setSelectedPlayer("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} ({team.shortName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Player</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer} disabled={!selectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTeamData?.players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Effect Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Kill Streak */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Kill Streak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Kill Count</Label>
                <Select
                  value={killStreakCount.toString()}
                  onValueChange={(v) => setKillStreakCount(Number.parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Double Kill (2)</SelectItem>
                    <SelectItem value="3">Triple Kill (3)</SelectItem>
                    <SelectItem value="4">Quad Kill (4)</SelectItem>
                    <SelectItem value="5">Rampage (5)</SelectItem>
                    <SelectItem value="6">Godlike (6+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={triggerKillStreak}
                disabled={!selectedPlayer}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                Trigger Kill Streak
              </Button>
            </CardContent>
          </Card>

          {/* Team Wipe */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Team Wipe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Announces that selected team was wiped</p>
              <Button onClick={triggerTeamWipe} disabled={!selectedTeam} className="w-full bg-red-600 hover:bg-red-700">
                Trigger Team Wipe
              </Button>
            </CardContent>
          </Card>

          {/* Epic Elimination */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Epic Elimination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Dramatic elimination announcement with particles</p>
              <Button
                onClick={triggerEpicElimination}
                disabled={!selectedPlayer}
                className="w-full bg-red-800 hover:bg-red-900"
              >
                Trigger Epic Kill
              </Button>
            </CardContent>
          </Card>

          {/* Clutch Moment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Clutch Moment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Situation</Label>
                <Select value={clutchSituation} onValueChange={setClutchSituation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1v2">1 vs 2</SelectItem>
                    <SelectItem value="1v3">1 vs 3</SelectItem>
                    <SelectItem value="1v4">1 vs 4</SelectItem>
                    <SelectItem value="2v4">2 vs 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => triggerClutch(true)}
                  disabled={!selectedPlayer}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Start Clutch
                </Button>
                <Button onClick={() => triggerClutch(false)} variant="outline">
                  End Clutch
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Zone Phase */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Zone Phase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Phase</Label>
                  <Input
                    type="number"
                    min={1}
                    max={9}
                    value={zonePhase}
                    onChange={(e) => setZonePhase(Number.parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Time (sec)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={zoneTime}
                    onChange={(e) => setZoneTime(Number.parseInt(e.target.value))}
                  />
                </div>
              </div>
              <Button onClick={triggerZoneUpdate} className="w-full bg-purple-600 hover:bg-purple-700">
                Update Zone
              </Button>
            </CardContent>
          </Card>

          {/* Airdrop */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Airdrop Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Location</Label>
                <Input
                  value={hotDropLocation}
                  onChange={(e) => setHotDropLocation(e.target.value)}
                  placeholder="e.g., Pochinki"
                />
              </div>
              <Button onClick={triggerAirdrop} className="w-full bg-orange-500 hover:bg-orange-600">
                Trigger Airdrop
              </Button>
            </CardContent>
          </Card>

          {/* Hot Drop */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Hot Drop Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Team Names (Comma separated, optional)</Label>
                <Input
                  value={hotDropTeams}
                  onChange={(e) => setHotDropTeams(e.target.value)}
                  placeholder="e.g., NV, 4AM, STE"
                />
              </div>
              <div>
                <Label>Intensity</Label>
                <Select
                  value={hotDropIntensity}
                  onValueChange={(v) => setHotDropIntensity(v as typeof hotDropIntensity)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={triggerHotDrop} className="w-full bg-red-500 hover:bg-red-600">
                Trigger Hot Drop
              </Button>
            </CardContent>
          </Card>

          {/* MVP Reveal */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">MVP Reveal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Cinematic MVP announcement with gold effects</p>
              <div className="space-y-2">
                <Button
                  onClick={triggerMVP}
                  disabled={!selectedPlayer}
                  className="w-full bg-gold text-black hover:bg-gold/80 font-bold uppercase tracking-wider text-xs"
                >
                  Reveal Selected MVP
                </Button>
                <Button
                  onClick={triggerSampleMVP}
                  className="w-full border border-dashed border-gold/40 bg-zinc-950 text-gold hover:bg-gold/10 hover:text-white transition-all font-bold uppercase tracking-wider text-xs"
                >
                  🎮 Demo Sample MVP Reveal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* WWCD */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">WWCD Celebration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Winner Winner Chicken Dinner celebration</p>
              <Button
                onClick={triggerWWCD}
                disabled={!selectedTeam}
                className="w-full bg-linear-to-r from-gold via-yellow-500 to-gold text-black hover:opacity-90"
              >
                Trigger WWCD
              </Button>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
