import { useMemo } from 'react'
import useSWR, { mutate } from 'swr'
import type { Tournament, Team, Match, TeamStanding, KillFeedEvent, OverlayConfig, Player, MatchResult, IntroConfig } from './types'
import { DEFAULT_POINT_SYSTEM } from './types'
import { getRealtimeSync } from './realtime'
import { supabase } from './supabase'
import { isValidImage } from './utils'

// Local storage keys
const STORAGE_KEYS = {
  TOURNAMENT: "pubg_tournament",
  TEAMS: "pubg_teams",
  MATCHES: "pubg_matches",
  STANDINGS: "pubg_standings",
  KILL_FEED: "pubg_kill_feed",
  OVERLAY_CONFIG: "pubg_overlay_config",
}

const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0,
  dedupingInterval: 5000,
}

// Helper to safely access localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

const sanitizeTeamRoster = (team: Team): Team => {
  const cleanLogo = isValidImage(team.logo) 
    ? team.logo! 
    : `https://api.dicebear.com/7.x/initials/svg?seed=${team.shortName || team.name}&backgroundColor=000000&fontSize=40&bold=true`

  const players = team.players || []
  const active = players.filter((p) => !p.isSub)
  const subs = players.filter((p) => p.isSub)

  const finalActive = [...active]
  while (finalActive.length < 4) {
    const pId = `p-${team.id}-act-${finalActive.length + 1}`
    const pName = `Combatant ${finalActive.length + 1}`
    finalActive.push({
      id: pId,
      name: pName,
      teamId: team.id,
      status: "alive",
      kills: 0,
      damage: 0,
      isSub: false,
      photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=Combatant%20${encodeURIComponent(team.name)}%20${finalActive.length + 1}`
    })
  }
  const cleanActive = finalActive.slice(0, 4)

  const finalSubs = [...subs]
  while (finalSubs.length < 2) {
    const pId = `p-${team.id}-sub-${finalSubs.length + 1}`
    const pName = `Sub ${finalSubs.length + 1}`
    finalSubs.push({
      id: pId,
      name: pName,
      teamId: team.id,
      status: "alive",
      kills: 0,
      damage: 0,
      isSub: true,
      photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=Sub%20${encodeURIComponent(team.name)}%20${finalSubs.length + 1}`
    })
  }
  const cleanSubs = finalSubs.slice(0, 2)

  const cleanPlayers = [...cleanActive, ...cleanSubs].map(p => ({
    ...p,
    photo: isValidImage(p.photo) 
      ? p.photo! 
      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`
  }))

  return {
    ...team,
    logo: cleanLogo,
    players: cleanPlayers
  }
}

const setToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return
  try {
    let storageValue = value
    if (key === STORAGE_KEYS.TEAMS) {
      const teams = value as any as Team[]
      storageValue = teams.map(t => sanitizeTeamRoster(t)) as any
    }
    localStorage.setItem(key, JSON.stringify(storageValue))
  } catch (e) {
    console.error('Storage error:', e)
  }
}

// Relational Database Fetchers & Savers with automatic LocalStorage Fallback

const tournamentFetcher = async (): Promise<Tournament> => {
  try {
    const { data, error } = await supabase
      .from('tournament')
      .select('*')
      .maybeSingle()
    if (error) throw error
    if (data) {
      return {
        id: data.id,
        name: data.name,
        status: data.status,
        format: data.format,
      } as any
    }
  } catch (e) {
    console.warn("Supabase tournament fetch failed, using local storage:", e)
  }
  return getFromStorage<Tournament>(STORAGE_KEYS.TOURNAMENT, createDefaultTournament())
}

const teamsFetcher = async (): Promise<Team[]> => {
  try {
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
    if (teamsError) throw teamsError

    if (teamsData) {
      if (teamsData.length === 0) {
        // Database successfully returned 0 teams! Sync local storage to avoid repopulating and return [] immediately.
        setToStorage(STORAGE_KEYS.TEAMS, [])
        return []
      }

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
      if (playersError) throw playersError

      const mapped = teamsData.map(t => ({
        id: t.id,
        name: t.name,
        shortName: t.short_name,
        logo: t.logo,
        color: t.color,
        players: (playersData || [])
          .filter(p => p.team_id === t.id)
          .map(p => ({
            id: p.id,
            teamId: p.team_id,
            name: p.name,
            status: p.status,
            kills: p.kills,
            damage: p.damage,
            photo: p.photo,
          }))
      }))
      const resolvedTeams = Array.from(new Map(mapped.map(t => [t.id, t])).values()).map(t => sanitizeTeamRoster(t))
      setToStorage(STORAGE_KEYS.TEAMS, resolvedTeams)
      return resolvedTeams
    }
  } catch (e) {
    console.warn("Supabase teams fetch failed, using local storage:", e)
  }
  return getFromStorage<Team[]>(STORAGE_KEYS.TEAMS, [])
}

const standingsFetcher = async (): Promise<TeamStanding[]> => {
  try {
    const { data, error } = await supabase
      .from('standings')
      .select('*')
    if (error) throw error
    if (data && data.length > 0) {
      return data.map(s => ({
        teamId: s.team_id,
        rank: s.rank,
        totalPoints: s.total_points,
        totalKills: s.total_kills,
        placementPoints: s.placement_points,
        killPoints: s.kill_points,
        wwcd: s.wwcd,
        matches: s.matches_json || [],
        team: null as any,
      }))
    }
  } catch (e) {
    console.warn("Supabase standings fetch failed, using local storage:", e)
  }
  return getFromStorage<TeamStanding[]>(STORAGE_KEYS.STANDINGS, [])
}

const killFeedFetcher = async (): Promise<KillFeedEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('kill_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    if (data && data.length > 0) {
      return data.map(k => ({
        id: k.id,
        timestamp: k.timestamp ? new Date(k.timestamp) : new Date(k.created_at),
        killerId: k.killer_id || '',
        killerName: k.killer_name,
        killerTeam: k.killer_team,
        victimId: k.victim_id || '',
        victimName: k.victim_name,
        victimTeam: k.victim_team,
        weapon: k.weapon,
        isKnock: k.is_knock,
      }))
    }
  } catch (e) {
    console.warn("Supabase killfeed fetch failed, using local storage:", e)
  }
  return getFromStorage<KillFeedEvent[]>(STORAGE_KEYS.KILL_FEED, [])
}

const overlayConfigFetcher = async (): Promise<OverlayConfig> => {
  try {
    const { data, error } = await supabase
      .from('overlay_config')
      .select('*')
      .maybeSingle()
    if (error) throw error
    if (data) {
      const local = getFromStorage<Partial<OverlayConfig>>(STORAGE_KEYS.OVERLAY_CONFIG, {})
      return {
        showRankings: data.show_rankings,
        showKillFeed: data.show_kill_feed,
        showTeamStatus: data.show_team_status,
        showMatchInfo: data.show_match_info,
        showPlayerCam: data.show_player_cam,
        showZonePhase: local.showZonePhase ?? true,
        showBranding: local.showBranding ?? true,
        tournamentLogo: local.tournamentLogo || "",
        tournamentName: local.tournamentName || "",
        theme: data.theme,
        animationsEnabled: data.animations_enabled,
      }
    }
  } catch (e) {
    console.warn("Supabase config fetch failed, using local storage:", e)
  }
  return getFromStorage<OverlayConfig>(STORAGE_KEYS.OVERLAY_CONFIG, {
    showRankings: true,
    showKillFeed: true,
    showTeamStatus: true,
    showMatchInfo: true,
    showPlayerCam: false,
    showZonePhase: true,
    showBranding: true,
    tournamentLogo: "",
    tournamentName: "",
    theme: 'default',
    animationsEnabled: true,
  })
}

// Relational Save router to keep the existing saveToSupabase calls clean and functional
const saveToSupabase = async <T>(key: string, value: T): Promise<void> => {
  setToStorage(key, value)
  try {
    if (key === STORAGE_KEYS.TOURNAMENT) {
      const t = value as any as Tournament
      await supabase.from('tournament').upsert({
        id: t.id || 'current',
        name: t.name,
        status: t.status,
        format: t.format,
        updated_at: new Date().toISOString()
      })
    } else if (key === STORAGE_KEYS.TEAMS) {
      const teams = (value as any as Team[]).map(t => sanitizeTeamRoster(t))
      // 1. Upsert Teams
      const teamsToUpsert = teams.map(t => ({
        id: t.id,
        name: t.name,
        short_name: t.shortName,
        logo: t.logo || null,
        color: t.color,
        updated_at: new Date().toISOString()
      }))
      await supabase.from('teams').upsert(teamsToUpsert, { onConflict: 'id' })

      // 2. Upsert Players
      const rawPlayers = teams.flatMap(t => 
        t.players.map(p => ({
          id: p.id,
          team_id: t.id,
          name: p.name,
          status: p.status,
          kills: p.kills,
          damage: p.damage,
          photo: p.photo || null,
          updated_at: new Date().toISOString()
        }))
      )
      
      // Deduplicate inside the payload batch by player id to prevent PG duplicate key upsert batch failures!
      const uniquePlayersMap = new Map<string, typeof rawPlayers[0]>()
      rawPlayers.forEach(p => uniquePlayersMap.set(p.id, p))
      const playersToUpsert = Array.from(uniquePlayersMap.values())

      if (playersToUpsert.length > 0) {
        await supabase.from('players').upsert(playersToUpsert, { onConflict: 'id' })
      }
    } else if (key === STORAGE_KEYS.STANDINGS) {
      const standings = value as any as TeamStanding[]
      const standingsToUpsert = standings.map(s => ({
        team_id: s.teamId,
        rank: s.rank,
        total_points: s.totalPoints,
        total_kills: s.totalKills,
        placement_points: s.placementPoints,
        kill_points: s.killPoints,
        wwcd: s.wwcd,
        matches_json: s.matches,
        updated_at: new Date().toISOString()
      }))
      await supabase.from('standings').upsert(standingsToUpsert, { onConflict: 'team_id' })
    } else if (key === STORAGE_KEYS.KILL_FEED) {
      const killFeed = value as any as KillFeedEvent[]
      if (killFeed.length === 0) {
        await supabase.from('kill_feed').delete().neq('id', '')
        return
      }
      const killFeedToUpsert = killFeed.map(k => ({
        id: k.id,
        killer_id: k.killerId || '',
        killer_name: k.killerName,
        killer_team: k.killerTeam,
        victim_id: k.victimId || '',
        victim_name: k.victimName,
        victim_team: k.victimTeam,
        weapon: k.weapon,
        is_knock: k.isKnock,
        timestamp: k.timestamp ? new Date(k.timestamp).toISOString() : new Date().toISOString(),
        created_at: new Date().toISOString()
      }))
      await supabase.from('kill_feed').upsert(killFeedToUpsert)
    } else if (key === STORAGE_KEYS.OVERLAY_CONFIG) {
      const config = value as any as OverlayConfig
      await supabase.from('overlay_config').upsert({
        id: 'default',
        show_rankings: config.showRankings,
        show_kill_feed: config.showKillFeed,
        show_team_status: config.showTeamStatus,
        show_match_info: config.showMatchInfo,
        show_player_cam: config.showPlayerCam,
        theme: config.theme,
        animations_enabled: config.animationsEnabled,
        updated_at: new Date().toISOString()
      })
    }
  } catch (e) {
    console.warn('Supabase relational sync warning (falling back to localStorage):', e)
  }
}

// Subscribe to Supabase realtime channels for cross-device updates
if (typeof window !== 'undefined') {
  try {
    // Clean up any existing channel with the same name before subscribing to avoid hot-reload duplicate subscription errors!
    const existing = supabase.channel('pubg_relational_changes')
    supabase.removeChannel(existing)

    supabase
      .channel('pubg_relational_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament' }, () => {
        mutate('tournament')
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        mutate('teams')
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        mutate('teams')
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'standings' }, () => {
        mutate('standings')
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kill_feed' }, () => {
        mutate('killFeed')
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'overlay_config' }, () => {
        mutate('overlayConfig')
      })
      .subscribe()
  } catch (e) {
    console.warn('Failed to subscribe to Supabase realtime changes:', e)
  }
}

// Default tournament data
const createDefaultTournament = (): Tournament => ({
  id: 'tournament-1',
  name: 'PUBG Mobile Championship',
  format: 'squad',
  pointSystem: DEFAULT_POINT_SYSTEM,
  teams: [],
  matches: [],
  status: 'setup',
  totalRounds: 3,
  gamesPerRound: 6,
})

// Helper to generate initials-based team logos dynamically and beautifully
const getTeamLogoUrl = (tag: string) => `https://api.dicebear.com/7.x/initials/svg?seed=${tag}&backgroundColor=000000&fontSize=40&bold=true`

// Helper to generate adventurer player avatar pictures dynamically
const getPlayerPhotoUrl = (playerName: string) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(playerName)}`

// Rich, high-quality, pre-populated list of 25 pro esports teams with full squads & subs (total 150 players)
export const SAMPLE_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Nova Esports',
    shortName: 'NOVA',
    logo: getTeamLogoUrl('NOVA'),
    color: '#FFD700',
    players: [
      { id: 't1-p1', name: 'Order', teamId: 'team-1', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Order') },
      { id: 't1-p2', name: 'Paraboy', teamId: 'team-1', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Paraboy') },
      { id: 't1-p3', name: 'Jimmy', teamId: 'team-1', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Jimmy') },
      { id: 't1-p4', name: 'Zao', teamId: 'team-1', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Zao') },
      { id: 't1-p5', name: 'King', teamId: 'team-1', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('King') },
      { id: 't1-p6', name: 'Suk', teamId: 'team-1', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Suk') },
    ]
  },
  {
    id: 'team-2',
    name: '4 Angry Men',
    shortName: '4AM',
    logo: getTeamLogoUrl('4AM'),
    color: '#FF4444',
    players: [
      { id: 't2-p1', name: '33Syi', teamId: 'team-2', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('33Syi') },
      { id: 't2-p2', name: 'Forever', teamId: 'team-2', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Forever') },
      { id: 't2-p3', name: 'Godv', teamId: 'team-2', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Godv') },
      { id: 't2-p4', name: 'King', teamId: 'team-2', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('King4AM') },
      { id: 't2-p5', name: 'Wangz', teamId: 'team-2', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Wangz') },
      { id: 't2-p6', name: 'ZG', teamId: 'team-2', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('ZG') },
    ]
  },
  {
    id: 'team-3',
    name: 'Vampire Esports',
    shortName: 'VMP',
    logo: getTeamLogoUrl('VMP'),
    color: '#9B59B6',
    players: [
      { id: 't3-p1', name: 'Joker', teamId: 'team-3', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Joker') },
      { id: 't3-p2', name: 'Snake', teamId: 'team-3', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Snake') },
      { id: 't3-p3', name: 'Chris', teamId: 'team-3', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Chris') },
      { id: 't3-p4', name: 'Marco', teamId: 'team-3', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Marco') },
      { id: 't3-p5', name: 'Fluke', teamId: 'team-3', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Fluke') },
      { id: 't3-p6', name: 'Rven', teamId: 'team-3', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Rven') },
    ]
  },
  {
    id: 'team-4',
    name: 'Stalwart Esports',
    shortName: 'STE',
    logo: getTeamLogoUrl('STE'),
    color: '#3498DB',
    players: [
      { id: 't4-p1', name: 'Carry', teamId: 'team-4', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Carry') },
      { id: 't4-p2', name: 'Ninja', teamId: 'team-4', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Ninja') },
      { id: 't4-p3', name: 'Fury', teamId: 'team-4', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Fury') },
      { id: 't4-p4', name: 'Beast', teamId: 'team-4', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Beast') },
      { id: 't4-p5', name: 'Top', teamId: 'team-4', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Top') },
      { id: 't4-p6', name: 'Action', teamId: 'team-4', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Action') },
    ]
  },
  {
    id: 'team-5',
    name: 'Bigetron RA',
    shortName: 'BTR',
    logo: getTeamLogoUrl('BTR'),
    color: '#E67E22',
    players: [
      { id: 't5-p1', name: 'Ryzen', teamId: 'team-5', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Ryzen') },
      { id: 't5-p2', name: 'Zuxxy', teamId: 'team-5', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Zuxxy') },
      { id: 't5-p3', name: 'Luxxy', teamId: 'team-5', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Luxxy') },
      { id: 't5-p4', name: 'Microboy', teamId: 'team-5', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Microboy') },
      { id: 't5-p5', name: 'Liquid', teamId: 'team-5', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Liquid') },
      { id: 't5-p6', name: 'GenF', teamId: 'team-5', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('GenF') },
    ]
  },
  {
    id: 'team-6',
    name: 'Natus Vincere',
    shortName: 'NAVI',
    logo: getTeamLogoUrl('NAVI'),
    color: '#F1C40F',
    players: [
      { id: 't6-p1', name: 'Orange', teamId: 'team-6', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Orange') },
      { id: 't6-p2', name: 'Kempp3', teamId: 'team-6', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Kempp3') },
      { id: 't6-p3', name: 'Bestoloch', teamId: 'team-6', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Bestoloch') },
      { id: 't6-p4', name: 'Mellman', teamId: 'team-6', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Mellman') },
      { id: 't6-p5', name: 'Cloud', teamId: 'team-6', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Cloud') },
      { id: 't6-p6', name: 'Matic', teamId: 'team-6', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Matic') },
    ]
  },
  {
    id: 'team-7',
    name: 'Team Liquid',
    shortName: 'TL',
    logo: getTeamLogoUrl('TL'),
    color: '#0A74DA',
    players: [
      { id: 't7-p1', name: 'Jeemz', teamId: 'team-7', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Jeemz') },
      { id: 't7-p2', name: 'Ibiza', teamId: 'team-7', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Ibiza') },
      { id: 't7-p3', name: 'Clib', teamId: 'team-7', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Clib') },
      { id: 't7-p4', name: 'Mxey', teamId: 'team-7', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Mxey') },
      { id: 't7-p5', name: 'Jimbo', teamId: 'team-7', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Jimbo') },
      { id: 't7-p6', name: 'Jemb', teamId: 'team-7', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Jemb') },
    ]
  },
  {
    id: 'team-8',
    name: 'IHC Esports',
    shortName: 'IHC',
    logo: getTeamLogoUrl('IHC'),
    color: '#C0392B',
    players: [
      { id: 't8-p1', name: 'Zyol', teamId: 'team-8', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Zyol') },
      { id: 't8-p2', name: 'Alex', teamId: 'team-8', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Alex') },
      { id: 't8-p3', name: 'Godless', teamId: 'team-8', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Godless') },
      { id: 't8-p4', name: 'Demire', teamId: 'team-8', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Demire') },
      { id: 't8-p5', name: 'Abely', teamId: 'team-8', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Abely') },
      { id: 't8-p6', name: 'Khan', teamId: 'team-8', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Khan') },
    ]
  },
  {
    id: 'team-9',
    name: 'Alpha7 Esports',
    shortName: 'A7',
    logo: getTeamLogoUrl('A7'),
    color: '#2ECC71',
    players: [
      { id: 't9-p1', name: 'Revo', teamId: 'team-9', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Revo') },
      { id: 't9-p2', name: 'Carrilho', teamId: 'team-9', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Carrilho') },
      { id: 't9-p3', name: 'Mafioso', teamId: 'team-9', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Mafioso') },
      { id: 't9-p4', name: 'Sena', teamId: 'team-9', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Sena') },
      { id: 't9-p5', name: 'Swag', teamId: 'team-9', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Swag') },
      { id: 't9-p6', name: 'Myth', teamId: 'team-9', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Myth') },
    ]
  },
  {
    id: 'team-10',
    name: 'FaZe Clan',
    shortName: 'FAZE',
    logo: getTeamLogoUrl('FAZE'),
    color: '#E74C3C',
    players: [
      { id: 't10-p1', name: 'Gustav', teamId: 'team-10', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Gustav') },
      { id: 't10-p2', name: 'Fexx', teamId: 'team-10', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Fexx') },
      { id: 't10-p3', name: 'D1gg3r1', teamId: 'team-10', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('D1gg3r1') },
      { id: 't10-p4', name: 'Aitzy', teamId: 'team-10', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Aitzy') },
      { id: 't10-p5', name: 'Haxete', teamId: 'team-10', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Haxete') },
      { id: 't10-p6', name: 'Jembz', teamId: 'team-10', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Jembz') },
    ]
  },
  {
    id: 'team-11',
    name: "D'Xavier",
    shortName: 'DX',
    logo: getTeamLogoUrl('DX'),
    color: '#F39C12',
    players: [
      { id: 't11-p1', name: 'Rabiz', teamId: 'team-11', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Rabiz') },
      { id: 't11-p2', name: 'Franky', teamId: 'team-11', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Franky') },
      { id: 't11-p3', name: 'Lamborghini', teamId: 'team-11', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Lamborghini') },
      { id: 't11-p4', name: 'TDuc', teamId: 'team-11', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('TDuc') },
      { id: 't11-p5', name: 'Ferrari', teamId: 'team-11', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Ferrari') },
      { id: 't11-p6', name: 'Porsche', teamId: 'team-11', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Porsche') },
    ]
  },
  {
    id: 'team-12',
    name: 'DRX Esports',
    shortName: 'DRX',
    logo: getTeamLogoUrl('DRX'),
    color: '#5DADE2',
    players: [
      { id: 't12-p1', name: 'Starlord', teamId: 'team-12', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Starlord') },
      { id: 't12-p2', name: 'Hulk', teamId: 'team-12', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Hulk') },
      { id: 't12-p3', name: 'Loki', teamId: 'team-12', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Loki') },
      { id: 't12-p4', name: 'Pio', teamId: 'team-12', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Pio') },
      { id: 't12-p5', name: 'Inonix', teamId: 'team-12', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Inonix') },
      { id: 't12-p6', name: 'Under', teamId: 'team-12', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Under') },
    ]
  },
  {
    id: 'team-13',
    name: 'Reject',
    shortName: 'RC',
    logo: getTeamLogoUrl('RC'),
    color: '#922B21',
    players: [
      { id: 't13-p1', name: 'Sara', teamId: 'team-13', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Sara') },
      { id: 't13-p2', name: 'Dido', teamId: 'team-13', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Dido') },
      { id: 't13-p3', name: 'Reiji', teamId: 'team-13', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Reiji') },
      { id: 't13-p4', name: 'Lapis', teamId: 'team-13', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Lapis') },
      { id: 't13-p5', name: 'Coral', teamId: 'team-13', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Coral') },
      { id: 't13-p6', name: 'Pearl', teamId: 'team-13', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Pearl') },
    ]
  },
  {
    id: 'team-14',
    name: 'Talon Esports',
    shortName: 'TLN',
    logo: getTeamLogoUrl('TLN'),
    color: '#1ABC9C',
    players: [
      { id: 't14-p1', name: 'Logan', teamId: 'team-14', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Logan') },
      { id: 't14-p2', name: 'Flame', teamId: 'team-14', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Flame') },
      { id: 't14-p3', name: 'Blitz', teamId: 'team-14', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Blitz') },
      { id: 't14-p4', name: 'Volt', teamId: 'team-14', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Volt') },
      { id: 't14-p5', name: 'Spark', teamId: 'team-14', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Spark') },
      { id: 't14-p6', name: 'Shock', teamId: 'team-14', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Shock') },
    ]
  },
  {
    id: 'team-15',
    name: 'Team Falcons',
    shortName: 'FLCN',
    logo: getTeamLogoUrl('FLCN'),
    color: '#27AE60',
    players: [
      { id: 't15-p1', name: 'Tect', teamId: 'team-15', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Tect') },
      { id: 't15-p2', name: 'Shoke', teamId: 'team-15', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Shoke') },
      { id: 't15-p3', name: 'Viper', teamId: 'team-15', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Viper') },
      { id: 't15-p4', name: 'Falcon', teamId: 'team-15', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Falcon') },
      { id: 't15-p5', name: 'Hawk', teamId: 'team-15', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Hawk') },
      { id: 't15-p6', name: 'Eagle', teamId: 'team-15', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Eagle') },
    ]
  },
  {
    id: 'team-16',
    name: 'Nigma Galaxy',
    shortName: 'NGX',
    logo: getTeamLogoUrl('NGX'),
    color: '#8E44AD',
    players: [
      { id: 't16-p1', name: 'Rahil', teamId: 'team-16', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Rahil') },
      { id: 't16-p2', name: 'Freak', teamId: 'team-16', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Freak') },
      { id: 't16-p3', name: 'Beast', teamId: 'team-16', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('BeastNGX') },
      { id: 't16-p4', name: 'Lord', teamId: 'team-16', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Lord') },
      { id: 't16-p5', name: 'Shadow', teamId: 'team-16', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Shadow') },
      { id: 't16-p6', name: 'Ghost', teamId: 'team-16', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Ghost') },
    ]
  },
  {
    id: 'team-17',
    name: 'S2G Esports',
    shortName: 'S2G',
    logo: getTeamLogoUrl('S2G'),
    color: '#3498DB',
    players: [
      { id: 't17-p1', name: 'Sly', teamId: 'team-17', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Sly') },
      { id: 't17-p2', name: 'Calse', teamId: 'team-17', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Calse') },
      { id: 't17-p3', name: 'Hams', teamId: 'team-17', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Hams') },
      { id: 't17-p4', name: 'Hakan', teamId: 'team-17', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Hakan') },
      { id: 't17-p5', name: 'Ali', teamId: 'team-17', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Ali') },
      { id: 't17-p6', name: 'Veli', teamId: 'team-17', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Veli') },
    ]
  },
  {
    id: 'team-18',
    name: 'Fut Esports',
    shortName: 'FUT',
    logo: getTeamLogoUrl('FUT'),
    color: '#E67E22',
    players: [
      { id: 't18-p1', name: 'Sol', teamId: 'team-18', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Sol') },
      { id: 't18-p2', name: 'Luna', teamId: 'team-18', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Luna') },
      { id: 't18-p3', name: 'Stella', teamId: 'team-18', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Stella') },
      { id: 't18-p4', name: 'Cosmos', teamId: 'team-18', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Cosmos') },
      { id: 't18-p5', name: 'Galaxy', teamId: 'team-18', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Galaxy') },
      { id: 't18-p6', name: 'Astro', teamId: 'team-18', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Astro') },
    ]
  },
  {
    id: 'team-19',
    name: 'Loops Esports',
    shortName: 'LOOPS',
    logo: getTeamLogoUrl('LOOPS'),
    color: '#16A085',
    players: [
      { id: 't19-p1', name: 'Federal', teamId: 'team-19', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Federal') },
      { id: 't19-p2', name: 'Mythic', teamId: 'team-19', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Mythic') },
      { id: 't19-p3', name: 'Legend', teamId: 'team-19', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Legend') },
      { id: 't19-p4', name: 'Titan', teamId: 'team-19', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Titan') },
      { id: 't19-p5', name: 'Hero', teamId: 'team-19', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Hero') },
      { id: 't19-p6', name: 'Giant', teamId: 'team-19', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Giant') },
    ]
  },
  {
    id: 'team-20',
    name: 'TSM Esports',
    shortName: 'TSM',
    logo: getTeamLogoUrl('TSM'),
    color: '#34495E',
    players: [
      { id: 't20-p1', name: 'Alphan', teamId: 'team-20', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Alphan') },
      { id: 't20-p2', name: 'Beta', teamId: 'team-20', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Beta') },
      { id: 't20-p3', name: 'Gamma', teamId: 'team-20', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Gamma') },
      { id: 't20-p4', name: 'Delta', teamId: 'team-20', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Delta') },
      { id: 't20-p5', name: 'Epsilon', teamId: 'team-20', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Epsilon') },
      { id: 't20-p6', name: 'Zeta', teamId: 'team-20', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Zeta') },
    ]
  },
  {
    id: 'team-21',
    name: 'G2 Esports',
    shortName: 'G2',
    logo: getTeamLogoUrl('G2'),
    color: '#7F8C8D',
    players: [
      { id: 't21-p1', name: 'Knight', teamId: 'team-21', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Knight') },
      { id: 't21-p2', name: 'Bishop', teamId: 'team-21', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Bishop') },
      { id: 't21-p3', name: 'Rook', teamId: 'team-21', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Rook') },
      { id: 't21-p4', name: 'Pawn', teamId: 'team-21', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Pawn') },
      { id: 't21-p5', name: 'Queen', teamId: 'team-21', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Queen') },
      { id: 't21-p6', name: 'KingG2', teamId: 'team-21', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('KingG2') },
    ]
  },
  {
    id: 'team-22',
    name: 'Twisted Minds',
    shortName: 'TM',
    logo: getTeamLogoUrl('TM'),
    color: '#E84393',
    players: [
      { id: 't22-p1', name: 'Spike', teamId: 'team-22', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Spike') },
      { id: 't22-p2', name: 'Spark', teamId: 'team-22', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Spark') },
      { id: 't22-p3', name: 'Pulse', teamId: 'team-22', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Pulse') },
      { id: 't22-p4', name: 'Wave', teamId: 'team-22', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Wave') },
      { id: 't22-p5', name: 'Tide', teamId: 'team-22', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Tide') },
      { id: 't22-p6', name: 'Current', teamId: 'team-22', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Current') },
    ]
  },
  {
    id: 'team-23',
    name: 'Geek Fam',
    shortName: 'GEEK',
    logo: getTeamLogoUrl('GEEK'),
    color: '#BADC58',
    players: [
      { id: 't23-p1', name: 'Ozzie', teamId: 'team-23', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Ozzie') },
      { id: 't23-p2', name: 'Dam', teamId: 'team-23', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Dam') },
      { id: 't23-p3', name: 'Rex', teamId: 'team-23', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Rex') },
      { id: 't23-p4', name: 'Moli', teamId: 'team-23', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Moli') },
      { id: 't23-p5', name: 'Chub', teamId: 'team-23', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Chub') },
      { id: 't23-p6', name: 'Tiny', teamId: 'team-23', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Tiny') },
    ]
  },
  {
    id: 'team-24',
    name: 'Alter Ego',
    shortName: 'AE',
    logo: getTeamLogoUrl('AE'),
    color: '#D63031',
    players: [
      { id: 't24-p1', name: 'Bad Boy', teamId: 'team-24', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('BadBoy') },
      { id: 't24-p2', name: 'Good Boy', teamId: 'team-24', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('GoodBoy') },
      { id: 't24-p3', name: 'Super Boy', teamId: 'team-24', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('SuperBoy') },
      { id: 't24-p4', name: 'Mega Boy', teamId: 'team-24', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('MegaBoy') },
      { id: 't24-p5', name: 'Ultra Boy', teamId: 'team-24', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('UltraBoy') },
      { id: 't24-p6', name: 'Giga Boy', teamId: 'team-24', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('GigaBoy') },
    ]
  },
  {
    id: 'team-25',
    name: 'Boom Esports',
    shortName: 'BOOM',
    logo: getTeamLogoUrl('BOOM'),
    color: '#FF7675',
    players: [
      { id: 't25-p1', name: 'Yummy', teamId: 'team-25', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Yummy') },
      { id: 't25-p2', name: 'Tasty', teamId: 'team-25', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Tasty') },
      { id: 't25-p3', name: 'Spicy', teamId: 'team-25', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Spicy') },
      { id: 't25-p4', name: 'Sweet', teamId: 'team-25', status: 'alive', kills: 0, damage: 0, photo: getPlayerPhotoUrl('Sweet') },
      { id: 't25-p5', name: 'Bitter', teamId: 'team-25', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Bitter') },
      { id: 't25-p6', name: 'Sour', teamId: 'team-25', status: 'alive', kills: 0, damage: 0, isSub: true, photo: getPlayerPhotoUrl('Sour') },
    ]
  }
]

// Relational SWR fetchers successfully bound above

// Custom Hooks for Real-Time Global State Management using SWR & Supabase
export function useTournament() {
  const { data, error, isLoading } = useSWR('tournament', tournamentFetcher, SWR_CONFIG)
  
  const updateTournament = async (updates: Partial<Tournament>) => {
    const current = data || createDefaultTournament()
    const updated = { ...current, ...updates }
    await saveToSupabase(STORAGE_KEYS.TOURNAMENT, updated)
    mutate('tournament', updated, false)
    getRealtimeSync()?.broadcast('CONFIG_UPDATE', updated)
  }
  
  return { tournament: data, error, isLoading, updateTournament }
}

export function useTeams() {
  const { data, error, isLoading } = useSWR('teams', teamsFetcher, SWR_CONFIG)
  
  const addTeam = async (team: Team) => {
    const current = data || []
    const uniqueCurrent = Array.from(new Map(current.map(t => [t.id, t])).values())
    if (uniqueCurrent.some(t => t.id === team.id)) return
    const updated = [...uniqueCurrent, team]
    await saveToSupabase(STORAGE_KEYS.TEAMS, updated)
    mutate('teams', updated, false)
    getRealtimeSync()?.broadcast('TEAM_UPDATE', updated)
  }

  const addTeamsBulk = async (newTeams: Team[]) => {
    const current = data || []
    const currentMap = new Map(current.map(t => [t.id, t]))
    newTeams.forEach(t => {
      if (!currentMap.has(t.id)) {
        currentMap.set(t.id, t)
      }
    })
    const updated = Array.from(currentMap.values())
    
    // 1. Optimistically mutate immediately
    mutate('teams', updated, false)
    
    // 2. Persist to cloud and local storage
    await saveToSupabase(STORAGE_KEYS.TEAMS, updated)
    
    // 3. Final background revalidation
    mutate('teams')
    getRealtimeSync()?.broadcast('TEAM_UPDATE', updated)
  }
  
  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    const current = data || []
    const updated = current.map(t => t.id === teamId ? { ...t, ...updates } : t)
    await saveToSupabase(STORAGE_KEYS.TEAMS, updated)
    mutate('teams', updated, false)
    getRealtimeSync()?.broadcast('TEAM_UPDATE', updated)
  }
  
  const removeTeam = async (teamId: string) => {
    const current = data || []
    const updated = current.filter(t => t.id !== teamId)
    
    // 1. Optimistically mutate immediately (instantly hides card in UI!)
    mutate('teams', updated, false)

    // 2. Also remove from local standings cache optimistically
    const currentStandings = getFromStorage<TeamStanding[]>(STORAGE_KEYS.STANDINGS, [])
    const updatedStandings = currentStandings.filter(s => s.teamId !== teamId)
    mutate('standings', updatedStandings, false)

    // 3. Explicitly delete from Supabase (cascades to players and standings automatically!)
    try {
      await supabase.from('teams').delete().eq('id', teamId)
    } catch (dbError) {
      console.warn('Supabase delete failed, relying on local sync:', dbError)
    }

    // 4. Save updated standings and teams to local/Supabase
    await saveToSupabase(STORAGE_KEYS.STANDINGS, updatedStandings)
    await saveToSupabase(STORAGE_KEYS.TEAMS, updated)
    
    // 5. Final background revalidation
    mutate('teams')
    mutate('standings')
    
    getRealtimeSync()?.broadcast('TEAM_UPDATE', updated)
    getRealtimeSync()?.broadcast('STANDINGS_UPDATE', updatedStandings)
  }

  const removeTeamsBulk = async (teamIds: string[]) => {
    const current = data || []
    const updated = current.filter(t => !teamIds.includes(t.id))
    
    // 1. Optimistically mutate immediately
    mutate('teams', updated, false)

    // 2. Remove from local standings cache
    const currentStandings = getFromStorage<TeamStanding[]>(STORAGE_KEYS.STANDINGS, [])
    const updatedStandings = currentStandings.filter(s => !teamIds.includes(s.teamId))
    mutate('standings', updatedStandings, false)

    // 3. Delete from Supabase in a single bulk query to prevent SWR race conditions
    try {
      await supabase.from('teams').delete().in('id', teamIds)
    } catch (dbError) {
      console.warn('Supabase bulk delete failed, relying on local sync:', dbError)
    }

    // 4. Save updated standings and teams to local/Supabase
    await saveToSupabase(STORAGE_KEYS.STANDINGS, updatedStandings)
    await saveToSupabase(STORAGE_KEYS.TEAMS, updated)
    
    // 5. Final background revalidation
    mutate('teams')
    mutate('standings')
    
    getRealtimeSync()?.broadcast('TEAM_UPDATE', updated)
    getRealtimeSync()?.broadcast('STANDINGS_UPDATE', updatedStandings)
  }
  
  const updatePlayerStatus = async (playerId: string, status: Player['status']) => {
    const current = data || []
    const updated = current.map(team => ({
      ...team,
      players: team.players.map(p => 
        p.id === playerId ? { ...p, status } : p
      )
    }))
    await saveToSupabase(STORAGE_KEYS.TEAMS, updated)
    mutate('teams', updated, false)
    getRealtimeSync()?.broadcast('TEAM_UPDATE', updated)
  }
  
  const addKillToPlayer = async (playerId: string) => {
    const current = data || []
    const updated = current.map(team => ({
      ...team,
      players: team.players.map(p => 
        p.id === playerId ? { ...p, kills: p.kills + 1 } : p
      )
    }))
    await saveToSupabase(STORAGE_KEYS.TEAMS, updated)
    mutate('teams', updated, false)
    getRealtimeSync()?.broadcast('TEAM_UPDATE', updated)
  }
  
  const resetAllPlayers = async () => {
    const current = data || []
    const updated = current.map(team => ({
      ...team,
      players: team.players.map(p => ({
        ...p,
        status: 'alive' as const,
        kills: 0,
        damage: 0
      }))
    }))
    await saveToSupabase(STORAGE_KEYS.TEAMS, updated)
    mutate('teams', updated, false)
    getRealtimeSync()?.broadcast('TEAM_UPDATE', updated)
    getRealtimeSync()?.broadcast('MATCH_START', { timestamp: Date.now() })
  }
  
  const memoizedTeams = useMemo(() => data || [], [data])

  return { 
    teams: memoizedTeams, 
    error, 
    isLoading, 
    addTeam, 
    addTeamsBulk,
    updateTeam, 
    removeTeam, 
    removeTeamsBulk,
    updatePlayerStatus,
    addKillToPlayer,
    resetAllPlayers
  }
}

export function useStandings() {
  const { data, error, isLoading } = useSWR('standings', standingsFetcher, SWR_CONFIG)
  const { teams } = useTeams()
  
  const updateStandings = async (standings: TeamStanding[]) => {
    // Strip the bulky nested 'team' objects before persisting to avoid QuotaExceededError
    const cleanStandings = standings.map(({ team, ...rest }) => rest)
    await saveToSupabase(STORAGE_KEYS.STANDINGS, cleanStandings)
    mutate('standings', cleanStandings, false)
    getRealtimeSync()?.broadcast('STANDINGS_UPDATE', standings)
  }
  
  const addMatchResult = async (teamId: string, result: MatchResult) => {
    const current = data || []
    const teamIndex = current.findIndex(s => s.teamId === teamId)
    
    if (teamIndex >= 0) {
      const standing = current[teamIndex]
      const updated = [...current]
      updated[teamIndex] = {
        ...standing,
        matches: [...standing.matches, result],
        totalKills: standing.totalKills + result.kills,
        placementPoints: standing.placementPoints + (result.points - result.kills),
        killPoints: standing.killPoints + result.kills,
        totalPoints: standing.totalPoints + result.points,
        wwcd: result.placement === 1 ? standing.wwcd + 1 : standing.wwcd,
      }
      // Strip bulky 'team' object
      const cleanUpdated = updated.map(({ team, ...rest }) => rest)
      await saveToSupabase(STORAGE_KEYS.STANDINGS, cleanUpdated)
      mutate('standings', cleanUpdated, false)
      getRealtimeSync()?.broadcast('STANDINGS_UPDATE', updated)
    }
  }
  
  // Dynamically join standings with latest team data so it is always fresh and lightweight in storage
  const joinedStandings = useMemo(() => {
    return (data || []).map(standing => {
      const foundTeam = teams.find(t => t.id === standing.teamId)
      return {
        ...standing,
        team: foundTeam || standing.team || {
          id: standing.teamId,
          name: "Loading Team...",
          shortName: "UNK",
          logo: "/placeholder.svg",
          color: "#7F8C8D",
          players: []
        }
      }
    })
  }, [data, teams])
  
  return { standings: joinedStandings, error, isLoading, updateStandings, addMatchResult }
}

export function useKillFeed() {
  const { data, error, isLoading } = useSWR('killFeed', killFeedFetcher, SWR_CONFIG)
  
  const addKillEvent = async (event: KillFeedEvent) => {
    const current = data || []
    const updated = [event, ...current].slice(0, 50) // Keep last 50 events
    await saveToSupabase(STORAGE_KEYS.KILL_FEED, updated)
    mutate('killFeed', updated, false)
    getRealtimeSync()?.broadcast('KILL_EVENT', updated)
  }
  
  const clearKillFeed = async () => {
    await saveToSupabase(STORAGE_KEYS.KILL_FEED, [])
    mutate('killFeed', [], false)
  }
  
  const memoizedKillFeed = useMemo(() => data || [], [data])

  return { killFeed: memoizedKillFeed, error, isLoading, addKillEvent, clearKillFeed }
}

export function useOverlayConfig() {
  const { data, error, isLoading } = useSWR('overlayConfig', overlayConfigFetcher, SWR_CONFIG)
  
  const updateConfig = async (updates: Partial<OverlayConfig>) => {
    const current = data || await overlayConfigFetcher()
    const updated = { ...current, ...updates }
    await saveToSupabase(STORAGE_KEYS.OVERLAY_CONFIG, updated)
    mutate('overlayConfig', updated, false)
    getRealtimeSync()?.broadcast('CONFIG_UPDATE', updated)
  }
  
  return { config: data, error, isLoading, updateConfig }
}

// Utility to calculate standings from teams and match results
export function calculateStandings(teams: Team[], standings: TeamStanding[]): TeamStanding[] {
  return standings
    .map(standing => ({
      ...standing,
      team: teams.find(t => t.id === standing.teamId) || standing.team,
    }))
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills
      return b.wwcd - a.wwcd
    })
    .map((standing, index) => ({
      ...standing,
      rank: index + 1,
    }))
}

// Hook to manage stream intro overlay settings (sponsors, casters, countdowns)
export function useIntroConfig() {
  const { data, error, isLoading } = useSWR('introConfig', () => {
    return getFromStorage<IntroConfig>("pubg_intro_config", {
      tournamentTitle: "PUBG MOBILE CHAMPIONSHIP",
      scrimTitle: "PRO SCRIMS - MATCH 1",
      matchRound: "ROUND 1",
      mapName: "ERANGEL",
      casters: [
        { id: "c1", name: "Caster One", role: "Play-by-Play", photo: "" },
        { id: "c2", name: "Caster Two", role: "Color Commentator", photo: "" }
      ],
      sponsors: [
        { id: "s1", name: "Apex Gaming", logoUrl: "" },
        { id: "s2", name: "Intel Core", logoUrl: "" }
      ],
      countdownMinutes: 5,
      showCountdown: true,
      streamTitle: "MATCH STARTING SOON",
    })
  }, SWR_CONFIG)

  const updateConfig = async (updates: Partial<IntroConfig>) => {
    const current = data || getFromStorage<IntroConfig>("pubg_intro_config", {
      tournamentTitle: "PUBG MOBILE CHAMPIONSHIP",
      scrimTitle: "PRO SCRIMS - MATCH 1",
      matchRound: "ROUND 1",
      mapName: "ERANGEL",
      casters: [],
      sponsors: [],
      countdownMinutes: 5,
      showCountdown: true,
      streamTitle: "MATCH STARTING SOON",
    })
    const updated = { ...current, ...updates } as IntroConfig
    setToStorage("pubg_intro_config", updated)
    mutate('introConfig', updated, false)
    getRealtimeSync()?.broadcast('INTRO_UPDATE', updated)
  }

  return { config: data, error, isLoading, updateConfig }
}

