"use client"

import { cn, isValidImage } from "@/lib/utils"
import { useTeams } from "@/lib/store"
import { SkullIcon } from "@/components/icons"

interface TeamStatusProps {
  variant?: "horizontal" | "vertical" | "grid"
  showKills?: boolean
  className?: string
}

export function TeamStatus({ variant = "horizontal", showKills = true, className }: TeamStatusProps) {
  const { teams } = useTeams()

  const getAliveCount = (team: (typeof teams)[0]) => {
    return team.players.filter((p) => !p.isSub).slice(0, 4).filter((p) => p.status === "alive").length
  }

  const getKnockedCount = (team: (typeof teams)[0]) => {
    return team.players.filter((p) => !p.isSub).slice(0, 4).filter((p) => p.status === "knocked").length
  }

  const getTeamKills = (team: (typeof teams)[0]) => {
    return team.players.filter((p) => !p.isSub).slice(0, 4).reduce((sum, p) => sum + p.kills, 0)
  }

  const isTeamEliminated = (team: (typeof teams)[0]) => {
    return team.players.filter((p) => !p.isSub).slice(0, 4).every((p) => p.status === "eliminated")
  }

  if (variant === "grid") {
    return (
      <div className={cn("grid grid-cols-4 gap-2", className)}>
        {teams.map((team) => {
          const alive = getAliveCount(team)
          const knocked = getKnockedCount(team)
          const eliminated = isTeamEliminated(team)
          const kills = getTeamKills(team)

          return (
            <div
              key={team.id}
              className={cn(
                "relative bg-background/90 backdrop-blur-sm rounded-lg p-2",
                "border-l-4 transition-all duration-300",
                eliminated && "opacity-40 grayscale",
              )}
              style={{ borderLeftColor: team.color }}
            >
              <div className="flex items-center gap-2 mb-1">
                <img src={isValidImage(team.logo) ? team.logo! : "/placeholder.svg"} alt={team.name} className="w-6 h-6 rounded object-cover" />
                <span className="font-bold text-sm">{team.shortName}</span>
              </div>

              <div className="flex items-center justify-between">
                {/* Player Status Dots */}
                <div className="flex gap-1">
                  {team.players.filter((p) => !p.isSub).slice(0, 4).map((player) => (
                    <div
                      key={player.id}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-colors",
                        player.status === "alive" && "bg-alive",
                        player.status === "knocked" && "bg-knocked animate-pulse",
                        player.status === "eliminated" && "bg-eliminated",
                      )}
                      title={`${player.name} - ${player.status}`}
                    />
                  ))}
                </div>

                {showKills && kills > 0 && (
                  <div className="flex items-center gap-0.5 text-xs">
                    <SkullIcon className="w-3 h-3 text-destructive" />
                    <span className="font-bold">{kills}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (variant === "vertical") {
    return (
      <div className={cn("space-y-1", className)}>
        {teams.map((team, index) => {
          const alive = getAliveCount(team)
          const eliminated = isTeamEliminated(team)
          const kills = getTeamKills(team)

          return (
            <div
              key={team.id}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5",
                "bg-background/90 backdrop-blur-sm rounded",
                "border-l-4 animate-slide-in-left",
                eliminated && "opacity-40",
              )}
              style={{
                borderLeftColor: team.color,
                animationDelay: `${index * 30}ms`,
              }}
            >
              <img src={isValidImage(team.logo) ? team.logo! : "/placeholder.svg"} alt={team.name} className="w-5 h-5 rounded object-cover" />
              <span className="font-bold text-sm w-12">{team.shortName}</span>

              {/* Player dots */}
              <div className="flex gap-1 flex-1">
                {team.players.filter((p) => !p.isSub).slice(0, 4).map((player) => (
                  <div
                    key={player.id}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      player.status === "alive" && "bg-alive",
                      player.status === "knocked" && "bg-knocked animate-pulse",
                      player.status === "eliminated" && "bg-eliminated",
                    )}
                  />
                ))}
              </div>

              {showKills && <span className="text-xs text-muted-foreground w-8 text-right">{kills}K</span>}
            </div>
          )
        })}
      </div>
    )
  }

  // Horizontal variant (default) - like broadcast lower third
  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {teams.map((team) => {
        const alive = getAliveCount(team)
        const eliminated = isTeamEliminated(team)
        const kills = getTeamKills(team)

        return (
          <div
            key={team.id}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1",
              "bg-background/80 backdrop-blur-sm rounded",
              eliminated && "opacity-30",
            )}
            style={{ borderBottom: `2px solid ${team.color}` }}
          >
            <span className="font-bold text-xs" style={{ color: team.color }}>
              {team.shortName}
            </span>
            <div className="flex gap-0.5">
              {team.players.filter((p) => !p.isSub).slice(0, 4).map((player) => (
                <div
                  key={player.id}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    player.status === "alive" && "bg-alive",
                    player.status === "knocked" && "bg-knocked",
                    player.status === "eliminated" && "bg-eliminated",
                  )}
                />
              ))}
            </div>
            {showKills && kills > 0 && <span className="text-[10px] text-muted-foreground">{kills}</span>}
          </div>
        )
      })}
    </div>
  )
}
