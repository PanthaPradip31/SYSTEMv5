// Core Types for PUBG Live Production System

export interface Team {
  id: string
  name: string
  shortName: string
  logo: string
  players: Player[]
  color: string
}

export interface Player {
  id: string
  name: string
  teamId: string
  status: "alive" | "knocked" | "eliminated"
  kills: number
  damage: number
  isSub?: boolean // 5th player (substitute) – not counted in active squad
  photo?: string // Player avatar/portrait URL
}

export interface Match {
  id: string
  tournamentId: string
  mapName: string
  status: "upcoming" | "live" | "finished"
  round: number
  game: number
  startTime: Date
  endTime?: Date
  zone: number
  playersAlive: number
  teamsAlive: number
}

export interface Tournament {
  id: string
  name: string
  format: "solo" | "duo" | "squad"
  pointSystem: PointSystem
  teams: Team[]
  matches: Match[]
  status: "setup" | "live" | "finished"
  currentMatch?: string
  totalRounds: number
  gamesPerRound: number
}

export interface PointSystem {
  killPoints: number
  placementPoints: Record<number, number>
}

export interface TeamStanding {
  teamId: string
  team: Team
  rank: number
  totalPoints: number
  totalKills: number
  placementPoints: number
  killPoints: number
  wwcd: number // Winner Winner Chicken Dinner count
  matches: MatchResult[]
}

export interface MatchResult {
  matchId: string
  placement: number
  kills: number
  points: number
}

export interface KillFeedEvent {
  id: string
  timestamp: Date
  killerId: string
  killerName: string
  killerTeam: string
  victimId: string
  victimName: string
  victimTeam: string
  weapon: string
  isKnock: boolean
}

export interface KillStreak {
  playerId: string
  playerName: string
  teamShortName: string
  teamColor: string
  count: number
  type: "double" | "triple" | "quad" | "rampage" | "godlike"
}

export interface TeamWipe {
  id: string
  wipedTeam: string
  wipedTeamColor: string
  wiperTeam: string
  wiperTeamColor: string
  timestamp: Date
}

export interface ClutchMoment {
  id: string
  playerId: string
  playerName: string
  teamShortName: string
  teamColor: string
  situation: string // "1v4", "1v3", etc.
  isActive: boolean
}

export interface ZonePhase {
  phase: number
  totalPhases: number
  timeRemaining: number
  isClosing: boolean
  isFinalCircle: boolean
}

export interface AirdropEvent {
  id: string
  timestamp: Date
  location?: string
}

export interface SpecialEvent {
  id: string
  type: "kill_streak" | "team_wipe" | "clutch" | "airdrop" | "wwcd" | "hot_drop" | "final_circle"
  data: unknown
  timestamp: Date
}

export interface MVPData {
  playerId: string
  playerName: string
  teamShortName: string
  teamLogo: string
  teamColor: string
  kills: number
  damage: number
  survivalTime: string
  isWWCD: boolean
  playerPhoto?: string // Player avatar/portrait URL
}

export interface PlayerCard {
  playerId: string
  playerName: string
  teamShortName: string
  teamLogo: string
  teamColor: string
  kills: number
  damage: number
  status: "alive" | "knocked" | "eliminated"
  playerPhoto?: string // Player avatar/portrait URL
}

export interface OverlayConfig {
  showRankings: boolean
  showKillFeed: boolean
  showTeamStatus: boolean
  showMatchInfo: boolean
  showPlayerCam: boolean
  showZonePhase?: boolean
  showBranding?: boolean
  tournamentLogo?: string
  tournamentName?: string
  theme: "default" | "minimal" | "broadcast"
  animationsEnabled: boolean
}

// Default Point System (PMGC 2024/2025 Standard)
// Updated with official PUBG Mobile Global Championship scoring
export const DEFAULT_POINT_SYSTEM: PointSystem = {
  killPoints: 1,
  placementPoints: {
    1: 10,   // WWCD (Winner Winner Chicken Dinner)
    2: 6,   // 2nd Place
    3: 5,   // 3rd Place
    4: 4,    // 4th Place
    5: 6,    // 5th Place
    6: 2,    // 6th Place
    7: 1,    // 7th Place
    8: 1,    // 8th Place
    9: 0,    // 9th Place
    10: 0,   // 10th Place
    11: 0,   // 11th Place and below
    12: 0,
    13: 0,
    14: 0,
    15: 0,
    16: 0,
    17: 0,
    18: 0,
    19: 0,
    20: 0,
    21: 0,
    22: 0,
    23: 0,
    24: 0,
    25: 0,
  },
}

// Additional scoring configurations for different tournament formats
export const PMGC_SCORING_INFO = {
  description: "PUBG Mobile Global Championship 2024-2025 Point System",
  killPoints: 1,
  placementRewards: {
    "1st": 10,
    "2nd": 6,
    "3rd": 5,
    "4th": 4,
    "5th": 3,
    "6th": 2,
    "7th": 1,
    "8th": 1,
    "9-10th": 0,
    "11th+": 0,
  },
  notes: "1 point per kill + placement points. WWCD = Winner with placement bonus",
}

export const MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik", "Karakin", "Nusa", "Rondo"] as const

export type MapName = (typeof MAPS)[number]

export interface Caster {
  id: string
  name: string
  role: string
  photo?: string
}

export interface Sponsor {
  id: string
  name: string
  logoUrl?: string
}

export interface IntroConfig {
  tournamentTitle: string
  scrimTitle: string
  matchRound: string
  mapName: string
  casters: Caster[]
  sponsors: Sponsor[]
  countdownMinutes: number
  showCountdown: boolean
  streamTitle?: string
}

