"use client"

import { useState } from "react"
import { cn, isValidImage } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTeams, useKillFeed, useStandings } from "@/lib/store"
import { getRealtimeSync } from "@/lib/realtime"
import type { Team, Player, KillFeedEvent, MatchResult, ZonePhase } from "@/lib/types"
import { SkullIcon, RefreshIcon, PlayIcon, TrophyIcon, ZoneIcon } from "@/components/icons"
import { TeamStatus } from "@/components/overlays/team-status"

export function MatchController() {
  const { teams, updatePlayerStatus, addKillToPlayer, resetAllPlayers } = useTeams()
  const { addKillEvent, clearKillFeed } = useKillFeed()
  const { addMatchResult, standings } = useStandings()
  const [selectedKiller, setSelectedKiller] = useState<{ player: Player; team: Team } | null>(null)
  const [matchActive, setMatchActive] = useState(false)
  const [lastWinner, setLastWinner] = useState<Team | null>(null)

  // Zone Phase Control State
  const [zoneActive, setZoneActive] = useState(false)
  const [zonePhase, setZonePhase] = useState(1)
  const [totalPhases, setTotalPhases] = useState(8)
  const [timeRemaining, setTimeRemaining] = useState(120) // Default 2 minutes
  const [isClosing, setIsClosing] = useState(false)
  const [isFinalCircle, setIsFinalCircle] = useState(false)

  const handlePlayerClick = (player: Player, team: Team) => {
    if (!matchActive) return

    if (!selectedKiller) {
      // Select as killer
      if (player.status === "alive") {
        setSelectedKiller({ player, team })
      }
    } else {
      // This is the victim
      if (player.id === selectedKiller.player.id) {
        // Deselect
        setSelectedKiller(null)
        return
      }

      // Process kill
      const isKnock = player.status === "alive"
      const newStatus = isKnock ? "knocked" : "eliminated"

      // Add kill to killer
      addKillToPlayer(selectedKiller.player.id)

      // Update victim status
      updatePlayerStatus(player.id, newStatus as "alive" | "knocked" | "eliminated")

      // Add kill feed event
      const killEvent: KillFeedEvent = {
        id: `kill-${Date.now()}`,
        timestamp: new Date(),
        killerId: selectedKiller.player.id,
        killerName: selectedKiller.player.name,
        killerTeam: selectedKiller.team.shortName,
        victimId: player.id,
        victimName: player.name,
        victimTeam: team.shortName,
        weapon: getRandomWeapon(),
        isKnock,
      }
      addKillEvent(killEvent)

      setSelectedKiller(null)
    }
  }

  const handleStatusChange = (player: Player, status: "alive" | "knocked" | "eliminated") => {
    updatePlayerStatus(player.id, status)
  }

  const handleStartMatch = () => {
    resetAllPlayers()
    clearKillFeed()
    setMatchActive(true)
    setLastWinner(null)
    // Deactivate/reset zone phase overlay
    setZoneActive(false)
    getRealtimeSync()?.broadcast("ZONE_UPDATE", null)
  }

  const handleEndMatch = () => {
    setMatchActive(false)
    // Deactivate/reset zone phase overlay
    setZoneActive(false)
    getRealtimeSync()?.broadcast("ZONE_UPDATE", null)

    // Calculate final placements based on elimination order
    const teamsWithAlive = teams
      .map((team) => ({
        team,
        aliveCount: team.players.filter((p) => !p.isSub).slice(0, 4).filter((p) => p.status !== "eliminated").length,
        totalKills: team.players.filter((p) => !p.isSub).slice(0, 4).reduce((sum, p) => sum + p.kills, 0),
      }))
      .sort((a, b) => b.aliveCount - a.aliveCount || b.totalKills - a.totalKills)

    // Set winner and trigger WWCD
    const winner = teamsWithAlive[0]
    setLastWinner(winner.team)

    getRealtimeSync()?.broadcast("WWCD_TRIGGER", {
      team: winner.team,
      kills: winner.totalKills,
    })

    // Update standings
    teamsWithAlive.forEach((item, index) => {
      const placement = index + 1
      const result: MatchResult = {
        matchId: `match-${Date.now()}`,
        placement,
        kills: item.totalKills,
        points: getPlacementPoints(placement) + item.totalKills,
      }
      addMatchResult(item.team.id, result)
    })

    getRealtimeSync()?.broadcast("MATCH_END", { winner: winner.team })
  }

  const handleUpdateZone = () => {
    setZoneActive(true)
    getRealtimeSync()?.broadcast("ZONE_UPDATE", {
      phase: zonePhase,
      totalPhases,
      timeRemaining,
      isClosing,
      isFinalCircle,
    } as ZonePhase)
  }

  const handleTurnOffZone = () => {
    setZoneActive(false)
    getRealtimeSync()?.broadcast("ZONE_UPDATE", null)
  }

  return (
    <div className="space-y-6">
      {/* Match Controls */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Match Control</span>
            <div
              className={cn(
                "flex items-center gap-2 text-sm font-normal",
                matchActive ? "text-alive" : "text-muted-foreground",
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", matchActive ? "bg-alive animate-pulse" : "bg-muted")} />
              {matchActive ? "Match Active" : "Match Inactive"}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            {!matchActive ? (
              <Button
                onClick={handleStartMatch}
                className="flex-1 gap-2 bg-alive hover:bg-alive/90 text-alive-foreground"
              >
                <PlayIcon className="w-4 h-4" />
                Start New Match
              </Button>
            ) : (
              <>
                <Button onClick={handleEndMatch} variant="destructive" className="flex-1 gap-2">
                  <TrophyIcon className="w-4 h-4" />
                  End Match
                </Button>
                <Button
                  onClick={() => {
                    resetAllPlayers()
                    clearKillFeed()
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshIcon className="w-4 h-4" />
                  Reset
                </Button>
              </>
            )}
          </div>

          {selectedKiller && (
            <div className="p-3 bg-gold/10 border border-gold/30 rounded-lg">
              <p className="text-sm">
                <span className="text-gold font-bold">{selectedKiller.player.name}</span>
                <span className="text-muted-foreground"> ({selectedKiller.team.shortName})</span>
                <span className="text-muted-foreground"> - Click a victim to record kill</span>
              </p>
            </div>
          )}

          {lastWinner && !matchActive && (
            <div className="p-3 bg-gold/20 border border-gold/50 rounded-lg text-center">
              <p className="text-sm text-gold font-bold">
                Winner: {lastWinner.name} ({lastWinner.shortName})
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zone Phase Control */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ZoneIcon className="w-5 h-5 text-gold" />
              Zone Phase Control
            </span>
            <div
              className={cn(
                "flex items-center gap-2 text-sm font-normal",
                zoneActive ? "text-alive font-semibold" : "text-muted-foreground",
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", zoneActive ? "bg-alive animate-pulse" : "bg-muted")} />
              {zoneActive ? `Active (Phase ${zonePhase}/${totalPhases})` : "Inactive (Off)"}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Phase Selection */}
            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Current Phase</label>
              <select
                value={zonePhase}
                onChange={(e) => setZonePhase(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-md border border-border bg-input text-foreground text-sm font-medium focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>Phase {num}</option>
                ))}
              </select>
            </div>

            {/* Total Phases Selection */}
            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Total Phases</label>
              <select
                value={totalPhases}
                onChange={(e) => setTotalPhases(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-md border border-border bg-input text-foreground text-sm font-medium focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {[5, 6, 7, 8, 9, 10, 12].map((num) => (
                  <option key={num} value={num}>{num} Phases</option>
                ))}
              </select>
            </div>

            {/* Time Remaining Selection */}
            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold block mb-1">Time (Minutes)</label>
              <select
                value={timeRemaining / 60}
                onChange={(e) => setTimeRemaining(Number(e.target.value) * 60)}
                className="w-full h-10 px-3 rounded-md border border-border bg-input text-foreground text-sm font-medium focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value={3}>3 Minutes</option>
                <option value={2}>2 Minutes</option>
                <option value={1.5}>1.5 Minutes</option>
                <option value={1}>1 Minute</option>
                <option value={0.5}>30 Seconds</option>
              </select>
            </div>

            {/* Status Flags */}
            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium select-none">
                <input
                  type="checkbox"
                  checked={isClosing}
                  onChange={(e) => setIsClosing(e.target.checked)}
                  className="rounded border-border bg-input text-gold focus:ring-gold"
                />
                <span>Zone Closing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium select-none">
                <input
                  type="checkbox"
                  checked={isFinalCircle}
                  onChange={(e) => setIsFinalCircle(e.target.checked)}
                  className="rounded border-border bg-input text-gold focus:ring-gold"
                />
                <span>Final Circle</span>
              </label>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground font-semibold flex items-center mr-2">Quick Presets:</span>
            {[180, 120, 90, 60, 30].map((secs) => (
              <Button
                key={secs}
                variant="outline"
                size="sm"
                onClick={() => setTimeRemaining(secs)}
                className={cn(
                  "h-8 text-xs bg-transparent border-border hover:border-gold hover:text-gold",
                  timeRemaining === secs && "border-gold text-gold bg-gold/10"
                )}
              >
                {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
              </Button>
            ))}
          </div>

          {/* Controls Trigger / Stop */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleUpdateZone}
              className="flex-1 gap-2 bg-gold hover:bg-gold/90 text-primary-foreground font-bold"
            >
              <PlayIcon className="w-4 h-4" />
              {zoneActive ? "Update & Sync Zone Phase" : "Activate Zone Overlay"}
            </Button>
            {zoneActive && (
              <Button
                onClick={handleTurnOffZone}
                variant="destructive"
                className="gap-2 px-6 font-bold"
              >
                Turn Off Zone
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Status Overview */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle>Team Status</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamStatus variant="grid" className="grid-cols-2 md:grid-cols-4" />
        </CardContent>
      </Card>

      {/* Player Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map((team) => (
          <Card
            key={team.id}
            className={cn(
              "bg-card border-border overflow-hidden",
              team.players.filter((p) => !p.isSub).slice(0, 4).every((p) => p.status === "eliminated") && "opacity-50",
            )}
          >
            <CardHeader
              className="pb-2 border-b border-border"
              style={{ borderLeftWidth: "4px", borderLeftColor: team.color }}
            >
              <CardTitle className="flex items-center gap-2 text-sm">
                <img src={isValidImage(team.logo) ? team.logo! : "/placeholder.svg"} alt={team.name} className="w-6 h-6 rounded" />
                {team.shortName}
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <SkullIcon className="w-3 h-3" />
                  {team.players.reduce((sum, p) => sum + p.kills, 0)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {team.players.filter((p) => !p.isSub).slice(0, 4).map((player) => (
                <div
                  key={player.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                    "hover:bg-secondary/50",
                    selectedKiller?.player.id === player.id && "bg-gold/20 ring-1 ring-gold",
                    player.status === "eliminated" && "opacity-50",
                  )}
                  onClick={() => handlePlayerClick(player, team)}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      player.status === "alive" && "bg-alive",
                      player.status === "knocked" && "bg-knocked animate-pulse",
                      player.status === "eliminated" && "bg-eliminated",
                    )}
                  />

                  <span
                    className={cn(
                      "flex-1 text-sm font-medium",
                      player.status === "eliminated" && "line-through text-muted-foreground",
                    )}
                  >
                    {player.name}
                  </span>

                  {player.kills > 0 && <span className="text-xs text-gold font-bold">{player.kills}K</span>}

                  {/* Quick status buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusChange(player, "alive")
                      }}
                      className={cn(
                        "w-4 h-4 rounded text-[8px] font-bold",
                        player.status === "alive" ? "bg-alive text-white" : "bg-secondary hover:bg-alive/50",
                      )}
                    >
                      A
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusChange(player, "knocked")
                      }}
                      className={cn(
                        "w-4 h-4 rounded text-[8px] font-bold",
                        player.status === "knocked" ? "bg-knocked text-white" : "bg-secondary hover:bg-knocked/50",
                      )}
                    >
                      K
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusChange(player, "eliminated")
                      }}
                      className={cn(
                        "w-4 h-4 rounded text-[8px] font-bold",
                        player.status === "eliminated"
                          ? "bg-eliminated text-white"
                          : "bg-secondary hover:bg-eliminated/50",
                      )}
                    >
                      E
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Helpers
function getRandomWeapon() {
  const weapons = ["AWM", "M416", "AKM", "M24", "Kar98k", "UMP45", "Groza", "Grenade"]
  return weapons[Math.floor(Math.random() * weapons.length)]
}

function getPlacementPoints(placement: number): number {
  const points: Record<number, number> = {
    1: 15,
    2: 12,
    3: 10,
    4: 8,
    5: 6,
    6: 4,
    7: 2,
    8: 1,
  }
  return points[placement] || 0
}
