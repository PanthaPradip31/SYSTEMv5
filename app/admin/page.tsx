"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTeams, useStandings, useKillFeed } from "@/lib/store"
import { SkullIcon, TrophyIcon, UsersIcon, PlayIcon } from "@/components/icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const { teams } = useTeams()
  const { standings } = useStandings()
  const { killFeed } = useKillFeed()

  const totalPlayers = teams.reduce((sum, team) => sum + team.players.filter((p) => !p.isSub).length, 0)
  const alivePlayers = teams.reduce((sum, team) => sum + team.players.filter((p) => !p.isSub && p.status === "alive").length, 0)
  const totalKills = killFeed.filter((k) => !k.isKnock).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">PUBG Live Production System Overview</p>
        </div>
        <Link href="/admin/match">
          <Button className="gradient-gold text-primary-foreground gap-2">
            <PlayIcon className="w-4 h-4" />
            Go to Live Match
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Teams</CardTitle>
            <UsersIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">{totalPlayers} players total</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Players Alive</CardTitle>
            <div className="w-4 h-4 rounded-full bg-alive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-alive">{alivePlayers}</div>
            <p className="text-xs text-muted-foreground">of {totalPlayers} players</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Kills</CardTitle>
            <SkullIcon className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{totalKills}</div>
            <p className="text-xs text-muted-foreground">this match</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Matches Played</CardTitle>
            <TrophyIcon className="w-4 h-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold">{standings.length > 0 ? standings[0].matches.length : 0}</div>
            <p className="text-xs text-muted-foreground">in tournament</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/match" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <PlayIcon className="w-4 h-4" />
                Start/Manage Live Match
              </Button>
            </Link>
            <Link href="/admin/teams" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <UsersIcon className="w-4 h-4" />
                Manage Teams
              </Button>
            </Link>
            <Link href="/admin/overlays" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <TrophyIcon className="w-4 h-4" />
                Configure Overlays
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>OBS Browser Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-secondary/50 rounded">
              <span>Rankings</span>
              <code className="text-xs text-muted-foreground">/overlay/rankings</code>
            </div>
            <div className="flex items-center justify-between p-2 bg-secondary/50 rounded">
              <span>Kill Feed</span>
              <code className="text-xs text-muted-foreground">/overlay/killfeed</code>
            </div>
            <div className="flex items-center justify-between p-2 bg-secondary/50 rounded">
              <span>Team Status</span>
              <code className="text-xs text-muted-foreground">/overlay/teams</code>
            </div>
            <div className="flex items-center justify-between p-2 bg-secondary/50 rounded">
              <span>Full Overlay</span>
              <code className="text-xs text-muted-foreground">/overlay/full</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
