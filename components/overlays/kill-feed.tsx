"use client"

import { cn } from "@/lib/utils"
import { useKillFeed, useTeams } from "@/lib/store"
import { SkullIcon } from "@/components/icons"
import { motion, AnimatePresence } from "framer-motion"

interface KillFeedProps {
  maxItems?: number
  className?: string
}

export function KillFeed({ maxItems = 6, className }: KillFeedProps) {
  const { killFeed } = useKillFeed()
  const { teams } = useTeams()

  const displayEvents = killFeed.slice(0, maxItems)

  const getTeamColor = (teamShortName: string) => {
    const team = teams.find((t) => t.shortName === teamShortName)
    return team?.color || "#888888"
  }

  const getWeaponIcon = (weapon: string) => {
    const weaponIcons: Record<string, string> = {
      AWM: "🎯",
      M416: "🔫",
      AKM: "🔫",
      M24: "🎯",
      Kar98k: "🎯",
      UMP45: "🔫",
      Groza: "🔫",
      Pan: "🍳",
      Grenade: "💣",
      Vehicle: "🚗",
    }
    return weaponIcons[weapon] || "⚔️"
  }

  if (displayEvents.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-1.5 overflow-hidden p-1", className)}>
      <AnimatePresence mode="popLayout">
        {displayEvents.map((event, index) => (
          <motion.div
            layout
            key={`${event.id}-${index}`}
            initial={{ opacity: 0, x: 250, scale: 0.9, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, x: -100, filter: "blur(4px)" }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 26,
              mass: 0.8,
              layout: { type: "spring", stiffness: 350, damping: 28 },
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg",
              "bg-background/80 backdrop-blur-sm border border-white/5 shadow-2xl",
              event.isKnock ? "border-l-4 border-knocked" : "border-l-4 border-destructive",
            )}
          >
            {/* Killer */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                style={{
                  backgroundColor: `${getTeamColor(event.killerTeam)}20`,
                  color: getTeamColor(event.killerTeam),
                  borderLeft: `2px solid ${getTeamColor(event.killerTeam)}`,
                }}
              >
                {event.killerTeam}
              </span>
              <span className="font-bold text-sm truncate text-foreground tracking-wide">{event.killerName}</span>
            </div>

            {/* Weapon/Action */}
            <div className="flex items-center gap-1 px-2 shrink-0">
              <span className="text-sm">{getWeaponIcon(event.weapon)}</span>
              {event.isKnock ? (
                <span className="text-[10px] text-knocked uppercase font-black tracking-wider animate-pulse">Knocked</span>
              ) : (
                <SkullIcon className="w-4 h-4 text-destructive drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
              )}
            </div>

            {/* Victim */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                style={{
                  backgroundColor: `${getTeamColor(event.victimTeam)}20`,
                  color: getTeamColor(event.victimTeam),
                  borderLeft: `2px solid ${getTeamColor(event.victimTeam)}`,
                }}
              >
                {event.victimTeam}
              </span>
              <span
                className={cn(
                  "font-bold text-sm truncate tracking-wide",
                  event.isKnock ? "text-knocked" : "text-muted-foreground line-through opacity-70",
                )}
              >
                {event.victimName}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
