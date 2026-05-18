"use client"

import { cn } from "@/lib/utils"
import { useKillFeed, useTeams } from "@/lib/store"
import { SkullIcon } from "@/components/icons"

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
    // Map weapon names to icons - simplified for demo
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
    <div className={cn("space-y-1", className)}>
      {displayEvents.map((event, index) => (
        <div
          key={event.id}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg",
            "bg-background/80 backdrop-blur-sm",
            "animate-slide-in-right shadow-lg",
            event.isKnock && "border-l-2 border-knocked",
            !event.isKnock && "border-l-2 border-destructive",
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Killer */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
              style={{
                backgroundColor: `${getTeamColor(event.killerTeam)}20`,
                color: getTeamColor(event.killerTeam),
                borderLeft: `2px solid ${getTeamColor(event.killerTeam)}`,
              }}
            >
              {event.killerTeam}
            </span>
            <span className="font-semibold text-sm truncate text-foreground">{event.killerName}</span>
          </div>

          {/* Weapon/Action */}
          <div className="flex items-center gap-1 px-2 shrink-0">
            <span className="text-sm">{getWeaponIcon(event.weapon)}</span>
            {event.isKnock ? (
              <span className="text-[10px] text-knocked uppercase font-bold">Knocked</span>
            ) : (
              <SkullIcon className="w-4 h-4 text-destructive" />
            )}
          </div>

          {/* Victim */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
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
                "font-semibold text-sm truncate",
                event.isKnock ? "text-knocked" : "text-muted-foreground line-through",
              )}
            >
              {event.victimName}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
