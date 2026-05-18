"use client"

// Real-time synchronization using BroadcastChannel API
// This enables real-time sync between admin panel and overlay tabs

const CHANNEL_NAME = "pubg-live-production"

export type SyncEventType =
  | "PLAYER_STATUS_UPDATE"
  | "KILL_EVENT"
  | "MATCH_START"
  | "MATCH_END"
  | "STANDINGS_UPDATE"
  | "TEAM_UPDATE"
  | "CONFIG_UPDATE"
  | "WWCD_TRIGGER"
  | "FORCE_REFRESH"
  | "TEAM_INTRO"
  | "PLAYER_SPOTLIGHT"
  | "SHOW_RESULTS"
  | "KILL_STREAK"
  | "TEAM_WIPE"
  | "CLUTCH_MOMENT"
  | "ZONE_UPDATE"
  | "AIRDROP"
  | "HOT_DROP"
  | "FINAL_CIRCLE"
  | "MVP_REVEAL"
  | "PLAYER_CARD"
  | "ELIMINATION_EPIC"
  | "SPECIAL_EVENT"
  | "INTRO_UPDATE"

export interface SyncEvent {
  type: SyncEventType
  payload: unknown
  timestamp: number
}

class RealtimeSync {
  private channel: BroadcastChannel | null = null
  private listeners: Map<SyncEventType, Set<(payload: unknown) => void>> = new Map()

  constructor() {
    if (typeof window !== "undefined") {
      this.channel = new BroadcastChannel(CHANNEL_NAME)
      this.channel.onmessage = (event: MessageEvent<SyncEvent>) => {
        this.handleMessage(event.data)
      }
    }
  }

  private handleMessage(event: SyncEvent) {
    const typeListeners = this.listeners.get(event.type)
    if (typeListeners) {
      typeListeners.forEach((listener) => listener(event.payload))
    }
  }

  broadcast(type: SyncEventType, payload: unknown) {
    if (this.channel) {
      const event: SyncEvent = {
        type,
        payload,
        timestamp: Date.now(),
      }
      this.channel.postMessage(event)
      // Also trigger local listeners
      this.handleMessage(event)
    }
  }

  subscribe(type: SyncEventType, callback: (payload: unknown) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback)
    }
  }

  destroy() {
    this.channel?.close()
    this.listeners.clear()
  }
}

// Singleton instance
let syncInstance: RealtimeSync | null = null

export function getRealtimeSync(): RealtimeSync {
  if (!syncInstance && typeof window !== "undefined") {
    syncInstance = new RealtimeSync()
  }
  return syncInstance!
}

// Hook for React components
import { useEffect } from "react"
import { mutate } from "swr"

export function useRealtimeSync() {
  useEffect(() => {
    const sync = getRealtimeSync()
    if (!sync) return

    // Subscribe to all event types and refresh SWR cache
    const unsubscribes = [
      sync.subscribe("PLAYER_STATUS_UPDATE", (payload) => mutate("teams", payload, false)),
      sync.subscribe("KILL_EVENT", (payload) => {
        mutate("killFeed", payload, false)
      }),
      sync.subscribe("MATCH_START", () => {
        mutate("teams")
        mutate("killFeed")
      }),
      sync.subscribe("MATCH_END", () => {
        mutate("standings")
        mutate("teams")
      }),
      sync.subscribe("STANDINGS_UPDATE", (payload) => mutate("standings", payload, false)),
      sync.subscribe("TEAM_UPDATE", (payload) => mutate("teams", payload, false)),
      sync.subscribe("CONFIG_UPDATE", (payload) => mutate("overlayConfig", payload, false)),
      sync.subscribe("FORCE_REFRESH", () => {
        mutate("teams")
        mutate("standings")
        mutate("killFeed")
        mutate("overlayConfig")
      }),
      sync.subscribe("TEAM_INTRO", () => mutate("teamIntro")),
      sync.subscribe("PLAYER_SPOTLIGHT", () => mutate("playerSpotlight")),
      sync.subscribe("SHOW_RESULTS", () => mutate("matchResults")),
      sync.subscribe("KILL_STREAK", () => mutate("killStreak")),
      sync.subscribe("TEAM_WIPE", () => mutate("teamWipe")),
      sync.subscribe("CLUTCH_MOMENT", () => mutate("clutchMoment")),
      sync.subscribe("ZONE_UPDATE", () => mutate("zonePhase")),
      sync.subscribe("AIRDROP", () => mutate("airdrop")),
      sync.subscribe("MVP_REVEAL", () => mutate("mvpReveal")),
      sync.subscribe("PLAYER_CARD", () => mutate("playerCard")),
      sync.subscribe("ELIMINATION_EPIC", () => mutate("epicElimination")),
      sync.subscribe("SPECIAL_EVENT", () => mutate("specialEvent")),
      sync.subscribe("INTRO_UPDATE", (payload) => mutate("introConfig", payload, false)),
    ]

    return () => {
      unsubscribes.forEach((unsub) => unsub())
    }
  }, [])

  return getRealtimeSync()
}
