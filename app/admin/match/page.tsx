"use client"

import { MatchController } from "@/components/admin/match-controller"
import { KillFeed } from "@/components/overlays/kill-feed"
import { TopFraggers } from "@/components/overlays/top-fraggers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MatchPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Match Control</h1>
        <p className="text-muted-foreground">Manage player status, record kills, and control the match</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MatchController />
        </div>

        <div className="space-y-6">
          {/* Kill Feed Preview */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Kill Feed Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <KillFeed maxItems={8} />
            </CardContent>
          </Card>

          {/* Top Fraggers */}
          <TopFraggers count={5} />
        </div>
      </div>
    </div>
  )
}
