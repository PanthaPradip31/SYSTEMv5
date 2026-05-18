// Analytics and Match Report Generation
import type { Team, TeamStanding, KillFeedEvent } from "./types"

export interface MatchReport {
  id: string
  timestamp: Date
  duration: string
  map: string
  totalKills: number
  winner: {
    team: Team
    kills: number
    points: number
  }
  standings: Array<{
    rank: number
    team: Team
    kills: number
    placement: number
    points: number
  }>
  topFraggers: Array<{
    name: string
    team: string
    kills: number
  }>
  killTimeline: KillFeedEvent[]
}

export interface TournamentReport {
  name: string
  totalMatches: number
  standings: TeamStanding[]
  mvp: {
    name: string
    team: string
    totalKills: number
  }
  mostKillsInMatch: {
    team: string
    kills: number
    matchId: string
  }
  totalKills: number
}

export function generateMatchReport(teams: Team[], killFeed: KillFeedEvent[], mapName = "Erangel"): MatchReport {
  // Calculate team stats from current match
  const teamStats = teams
    .map((team) => {
      const kills = team.players.reduce((sum, p) => sum + p.kills, 0)
      const aliveCount = team.players.filter((p) => p.status !== "eliminated").length
      return { team, kills, aliveCount }
    })
    .sort((a, b) => b.aliveCount - a.aliveCount || b.kills - a.kills)

  // Determine placements using PMGC 2024-2025 scoring
  const standings = teamStats.map((stat, index) => ({
    rank: index + 1,
    team: stat.team,
    kills: stat.kills,
    placement: index + 1,
    points: getPMGCPlacementPoints(index + 1) + stat.kills,
  }))

  // Get top fraggers
  const allPlayers = teams
    .flatMap((team) => team.players.map((p) => ({ name: p.name, team: team.shortName, kills: p.kills })))
    .filter((p) => p.kills > 0)
    .sort((a, b) => b.kills - a.kills)
    .slice(0, 5)

  const winner = standings[0]

  return {
    id: `match-${Date.now()}`,
    timestamp: new Date(),
    duration: calculateMatchDuration(killFeed),
    map: mapName,
    totalKills: killFeed.filter((k) => !k.isKnock).length,
    winner: {
      team: winner.team,
      kills: winner.kills,
      points: winner.points,
    },
    standings,
    topFraggers: allPlayers,
    killTimeline: killFeed,
  }
}

export function generateTournamentReport(name: string, standings: TeamStanding[], teams: Team[]): TournamentReport {
  const sortedStandings = [...standings].sort((a, b) => b.totalPoints - a.totalPoints)

  // Find MVP (most kills across all matches)
  const allPlayerKills: Record<string, { name: string; team: string; kills: number }> = {}
  teams.forEach((team) => {
    team.players.forEach((player) => {
      // In a real scenario, you'd track kills per player across matches
      // For now, we'll use the standings data
      const teamStanding = standings.find((s) => s.teamId === team.id)
      if (teamStanding) {
        const estimatedKills = Math.floor(teamStanding.totalKills / 4)
        allPlayerKills[player.id] = {
          name: player.name,
          team: team.shortName,
          kills: estimatedKills,
        }
      }
    })
  })

  const mvp = Object.values(allPlayerKills).sort((a, b) => b.kills - a.kills)[0] || {
    name: "N/A",
    team: "N/A",
    totalKills: 0,
  }

  // Find most kills in a single match
  let mostKillsInMatch = { team: "", kills: 0, matchId: "" }
  standings.forEach((standing) => {
    standing.matches.forEach((match) => {
      if (match.kills > mostKillsInMatch.kills) {
        mostKillsInMatch = {
          team: standing.team.shortName,
          kills: match.kills,
          matchId: match.matchId,
        }
      }
    })
  })

  return {
    name,
    totalMatches: sortedStandings[0]?.matches.length || 0,
    standings: sortedStandings,
    mvp: {
      name: mvp.name,
      team: mvp.team,
      totalKills: mvp.kills,
    },
    mostKillsInMatch,
    totalKills: standings.reduce((sum, s) => sum + s.totalKills, 0),
  }
}

export function exportToCSV(standings: TeamStanding[]): string {
  const headers = ["Rank", "Team", "Short Name", "Total Points", "Kills", "Placement Points", "WWCD", "Matches Played"]
  const rows = standings.map((s, i) => [
    i + 1,
    s.team.name,
    s.team.shortName,
    s.totalPoints,
    s.totalKills,
    s.placementPoints,
    s.wwcd,
    s.matches.length,
  ])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

export function exportToJSON(data: unknown): string {
  return JSON.stringify(data, null, 2)
}

// PMGC 2024-2025 Placement Points Scoring
// Official PUBG Mobile Global Championship scoring system
function getPMGCPlacementPoints(placement: number): number {
  const points: Record<number, number> = {
    1: 15,   // 1st Place (WWCD)
    2: 12,   // 2nd Place
    3: 10,   // 3rd Place
    4: 8,    // 4th Place
    5: 6,    // 5th Place
    6: 4,    // 6th Place
    7: 2,    // 7th Place
    8: 1,    // 8th Place
    9: 1,    // 9th Place
    10: 1,   // 10th Place
    // 11th place and below = 0 points
  }
  return points[placement] || 0
}

function calculateMatchDuration(killFeed: KillFeedEvent[]): string {
  if (killFeed.length < 2) return "00:00"

  const sorted = [...killFeed].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const start = new Date(sorted[0].timestamp).getTime()
  const end = new Date(sorted[sorted.length - 1].timestamp).getTime()
  const durationMs = end - start

  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}
