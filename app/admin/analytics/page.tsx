"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTeams, useStandings, useKillFeed, useTournament } from "@/lib/store"
import { generateMatchReport, generateTournamentReport, exportToCSV, exportToJSON } from "@/lib/analytics"
import { TrophyIcon, SkullIcon, UsersIcon } from "@/components/icons"
import { cn, isValidImage } from "@/lib/utils"
import type { TeamStanding, MVPData } from "@/lib/types"
import { getRealtimeSync } from "@/lib/realtime"
import { MVPRevealOverlay } from "@/components/overlays/mvp-reveal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts"

export default function AnalyticsPage() {
  const { teams } = useTeams()
  const { standings } = useStandings()
  const { killFeed } = useKillFeed()
  const { tournament } = useTournament()
  const [activeTab, setActiveTab] = useState<"overview" | "charts" | "export">("overview")
  const [selectedTeam, setSelectedTeam] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState("")

  const selectedTeamData = teams.find((t) => t.id === selectedTeam)
  const selectedPlayerData = selectedTeamData?.players.find((p) => p.id === selectedPlayer)

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

  const triggerTeamWipe = () => {
    if (!selectedTeamData) return
    const randomWiper = teams[Math.floor(Math.random() * teams.length)] || selectedTeamData

    const wipe = {
      id: `wipe-${Date.now()}`,
      wipedTeam: selectedTeamData.shortName,
      wipedTeamColor: selectedTeamData.color,
      wiperTeam: randomWiper.shortName,
      wiperTeamColor: randomWiper.color,
      timestamp: new Date(),
    }

    getRealtimeSync()?.broadcast("TEAM_WIPE", wipe)
  }

  const tournamentReport = generateTournamentReport(tournament?.name || "Tournament", standings, teams)

  const killsChartData = standings
    .sort((a, b) => b.totalKills - a.totalKills)
    .slice(0, 10)
    .map((s) => ({
      name: s.team.shortName,
      kills: s.totalKills,
      points: s.totalPoints,
      color: s.team.color,
    }))

  const pointsBreakdownData = standings.slice(0, 8).map((s) => ({
    name: s.team.shortName,
    placement: s.placementPoints,
    kills: s.killPoints,
  }))

  const pieData = standings.slice(0, 6).map((s) => ({
    name: s.team.shortName,
    value: s.totalKills,
    color: s.team.color,
  }))

  // Match-by-match performance for line chart
  const matchPerformanceData =
    standings[0]?.matches.map((_, matchIndex) => {
      const matchData: Record<string, number | string> = { match: `M${matchIndex + 1}` }
      standings.slice(0, 4).forEach((s) => {
        if (s.matches[matchIndex]) {
          matchData[s.team.shortName] = s.matches[matchIndex].points
        }
      })
      return matchData
    }) || []

  const CHART_COLORS = ["#FFD700", "#3498DB", "#2ECC71", "#E67E22", "#9B59B6", "#FF4444"]

  const handleExportCSV = () => {
    const csv = exportToCSV(standings)
    downloadFile(csv, "standings.csv", "text/csv")
  }

  const handleExportJSON = () => {
    const json = exportToJSON({
      tournament: tournament,
      standings: standings,
      teams: teams,
    })
    downloadFile(json, "tournament-data.json", "application/json")
  }

  const handleExportMatchReport = () => {
    const report = generateMatchReport(teams, killFeed)
    const json = exportToJSON(report)
    downloadFile(json, `match-report-${report.id}.json`, "application/json")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Tournament statistics and data export</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          <Button variant={activeTab === "overview" ? "default" : "outline"} onClick={() => setActiveTab("overview")}>
            Overview
          </Button>
          <Button variant={activeTab === "charts" ? "default" : "outline"} onClick={() => setActiveTab("charts")}>
            Charts
          </Button>
          <Button variant={activeTab === "export" ? "default" : "outline"} onClick={() => setActiveTab("export")}>
            Export Data
          </Button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Tournament Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
                <TrophyIcon className="w-4 h-4 text-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tournamentReport.totalMatches}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Kills</CardTitle>
                <SkullIcon className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{tournamentReport.totalKills}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Teams</CardTitle>
                <UsersIcon className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{teams.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Kills/Match</CardTitle>
                <SkullIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {tournamentReport.totalMatches > 0
                    ? (tournamentReport.totalKills / tournamentReport.totalMatches).toFixed(1)
                    : "0"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Live Cinematic Broadcast Control Deck ── */}
          <Card className="bg-card border-border shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-gold/10 via-amber-500/5 to-gold/10 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="flex items-center gap-2.5 text-gold text-xl font-extrabold uppercase tracking-wide">
                <span>🎬 Live Broadcast Special Effects Deck</span>
                <span className="text-[10px] bg-red-950/85 border border-red-500/30 text-red-400 px-2 py-0.5 rounded font-black tracking-widest animate-pulse">LIVE CONTROL</span>
              </CardTitle>
              <CardDescription>
                Trigger broadcast cinematic overlay alerts and run real-time MVP reveals instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid md:grid-cols-5 gap-6">
              {/* Left Column: Target Selector Dropdowns */}
              <div className="md:col-span-2 space-y-4 md:border-r border-border/40 md:pr-6">
                <h4 className="text-xs font-black uppercase text-neutral-300 tracking-wider">🎯 Select Roster Targets</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Esports Team</Label>
                    <Select
                      value={selectedTeam}
                      onValueChange={(v) => {
                        setSelectedTeam(v)
                        setSelectedPlayer("")
                      }}
                    >
                      <SelectTrigger className="bg-zinc-950/60 border-border/60 mt-1">
                        <SelectValue placeholder="Pick active team" />
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
                    <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Combatant Player</Label>
                    <Select value={selectedPlayer} onValueChange={setSelectedPlayer} disabled={!selectedTeam}>
                      <SelectTrigger className="bg-zinc-950/60 border-border/60 mt-1">
                        <SelectValue placeholder="Pick player target" />
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
                </div>
              </div>

              {/* Right Column: Tactical Action Grid */}
              <div className="md:col-span-3 space-y-4">
                <h4 className="text-xs font-black uppercase text-neutral-300 tracking-wider">⚡ Broadcast Action Triggers</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button
                    onClick={triggerMVP}
                    disabled={!selectedPlayer}
                    className="w-full bg-gold text-black hover:bg-gold/90 font-extrabold uppercase text-xs tracking-wider py-5"
                  >
                    🏆 Reveal Selected MVP
                  </Button>
                  <Button
                    onClick={triggerSampleMVP}
                    className="w-full border border-dashed border-gold/50 bg-zinc-950/80 text-gold hover:bg-gold/10 hover:text-white transition-all font-extrabold uppercase text-xs tracking-wider py-5"
                  >
                    🎮 Demo 1-Click MVP
                  </Button>
                  <Button
                    onClick={triggerWWCD}
                    disabled={!selectedTeam}
                    className="w-full bg-linear-to-r from-amber-600 to-amber-700 text-white hover:opacity-90 font-extrabold uppercase text-xs tracking-wider py-5"
                  >
                    🍗 Trigger WWCD Celebrate
                  </Button>
                  <Button
                    onClick={triggerTeamWipe}
                    disabled={!selectedTeam}
                    className="w-full bg-red-800 hover:bg-red-950 text-white font-extrabold uppercase text-xs tracking-wider py-5"
                  >
                    💥 Trigger Team Wipe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Highlights */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Tournament MVP</CardTitle>
                <CardDescription>Player with most kills</CardDescription>
              </CardHeader>
              <CardContent>
                {tournamentReport.mvp.name !== "N/A" ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-2xl font-black text-gold">MVP</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{tournamentReport.mvp.name}</h3>
                      <p className="text-muted-foreground">{tournamentReport.mvp.team}</p>
                      <p className="text-sm text-gold font-medium mt-1">{tournamentReport.mvp.totalKills} kills</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data yet</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Most Kills in Single Match</CardTitle>
                <CardDescription>Team performance record</CardDescription>
              </CardHeader>
              <CardContent>
                {tournamentReport.mostKillsInMatch.kills > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                      <SkullIcon className="w-8 h-8 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{tournamentReport.mostKillsInMatch.team}</h3>
                      <p className="text-3xl font-black text-destructive">
                        {tournamentReport.mostKillsInMatch.kills} kills
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full Standings Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Full Standings</CardTitle>
            </CardHeader>
            <CardContent>
              {standings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2">#</th>
                        <th className="text-left py-3 px-2">Team</th>
                        <th className="text-center py-3 px-2">Matches</th>
                        <th className="text-center py-3 px-2">WWCD</th>
                        <th className="text-center py-3 px-2">Kills</th>
                        <th className="text-center py-3 px-2">Placement Pts</th>
                        <th className="text-center py-3 px-2">Kill Pts</th>
                        <th className="text-right py-3 px-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings
                        .sort((a, b) => b.totalPoints - a.totalPoints)
                        .map((standing, index) => (
                          <tr
                            key={standing.teamId}
                            className={cn("border-b border-border/50", index === 0 && "bg-gold/10")}
                          >
                            <td className="py-3 px-2 font-bold">{index + 1}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src={(standing.team && isValidImage(standing.team.logo)) ? standing.team.logo! : "/placeholder.svg"}
                                  alt={standing.team?.name || "Deleted Team"}
                                  className="w-6 h-6 rounded object-contain bg-zinc-950/40 p-0.5 border border-white/5"
                                />
                                <span className="font-medium">{standing.team?.shortName || "DEL"}</span>
                              </div>
                            </td>
                            <td className="text-center py-3 px-2">{standing.matches.length}</td>
                            <td className="text-center py-3 px-2 text-gold font-bold">
                              {standing.wwcd > 0 ? standing.wwcd : "-"}
                            </td>
                            <td className="text-center py-3 px-2">{standing.totalKills}</td>
                            <td className="text-center py-3 px-2">{standing.placementPoints}</td>
                            <td className="text-center py-3 px-2">{standing.killPoints}</td>
                            <td className="text-right py-3 px-2 font-bold text-gold text-lg">{standing.totalPoints}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No standings data. Initialize standings in Tournament Setup first.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "charts" && (
        <div className="space-y-6">
          {standings.length > 0 ? (
            <>
              {/* Kills Bar Chart */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Team Kills Comparison</CardTitle>
                  <CardDescription>Total kills by team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={killsChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" stroke="#888" />
                        <YAxis type="category" dataKey="name" stroke="#888" width={60} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="kills" fill="#FFD700" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Points Breakdown */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Points Breakdown</CardTitle>
                    <CardDescription>Placement vs Kill points</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pointsBreakdownData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1a1a",
                              border: "1px solid #333",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar dataKey="placement" name="Placement" fill="#3498DB" stackId="a" />
                          <Bar dataKey="kills" name="Kills" fill="#E67E22" stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Kill Distribution</CardTitle>
                    <CardDescription>Share of total kills by team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1a1a",
                              border: "1px solid #333",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Match Performance Line Chart */}
              {matchPerformanceData.length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Match-by-Match Performance</CardTitle>
                    <CardDescription>Points earned per match (Top 4 teams)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={matchPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="match" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1a1a",
                              border: "1px solid #333",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          {standings.slice(0, 4).map((s, i) => (
                            <Line
                              key={s.teamId}
                              type="monotone"
                              dataKey={s.team.shortName}
                              stroke={s.team.color || CHART_COLORS[i]}
                              strokeWidth={2}
                              dot={{ fill: s.team.color || CHART_COLORS[i] }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">
                  No standings data available. Initialize standings in Tournament Setup and record some matches first.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "export" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Export Standings (CSV)</CardTitle>
              <CardDescription>Download current standings as a CSV file for spreadsheets</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportCSV} className="w-full" disabled={standings.length === 0}>
                Download CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Export Full Data (JSON)</CardTitle>
              <CardDescription>Download complete tournament data including teams and standings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportJSON} className="w-full" disabled={teams.length === 0}>
                Download JSON
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Current Match Report</CardTitle>
              <CardDescription>Generate report for the current/last match</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportMatchReport} className="w-full" disabled={teams.length === 0}>
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Social Media Export</CardTitle>
              <CardDescription>Copy formatted text for social media posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {generateSocialMediaText(tournament?.name || "Tournament", standings)}
              </div>
              <Button
                className="mt-4"
                onClick={() => {
                  navigator.clipboard.writeText(generateSocialMediaText(tournament?.name || "Tournament", standings))
                }}
              >
                Copy to Clipboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Active Cinematic Overlay Live Preview */}
      <MVPRevealOverlay />
    </div>
  )
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generateSocialMediaText(name: string, standings: TeamStanding[]): string {
  if (standings.length === 0) return "No standings data available"

  const sorted = [...standings].sort((a, b) => b.totalPoints - a.totalPoints)
  const top5 = sorted.slice(0, 5)

  let text = `🏆 ${name} - Current Standings\n\n`

  top5.forEach((s, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`
    text += `${medal} ${s.team.shortName} - ${s.totalPoints} pts (${s.totalKills} kills)\n`
  })

  text += `\n#PUBG #Esports #Tournament`

  return text
}
