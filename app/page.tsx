"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrophyIcon, PlayIcon, SettingsIcon, UsersIcon } from "@/components/icons"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--gold)_0%,_transparent_50%)] opacity-10" />

        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-6">
              <div className="w-2 h-2 rounded-full bg-alive animate-pulse" />
              <span className="text-sm text-gold font-medium">Real-Time Tournament Production</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight">
              PUBG Live
              <span className="block text-gold">Production System</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Professional-grade live production overlay for PUBG Mobile tournaments. Automated rankings, kill feeds,
              and broadcast-ready graphics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/admin">
                <Button size="lg" className="gradient-gold text-primary-foreground font-bold gap-2 px-8">
                  <PlayIcon className="w-5 h-5" />
                  Launch Admin Panel
                </Button>
              </Link>
              <Link href="/overlay/full">
                <Button size="lg" variant="outline" className="gap-2 px-8 bg-transparent">
                  <SettingsIcon className="w-5 h-5" />
                  Preview Overlays
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border hover:border-gold/50 transition-colors">
            <CardHeader>
              <TrophyIcon className="w-10 h-10 text-gold mb-2" />
              <CardTitle>Live Rankings</CardTitle>
              <CardDescription>
                Auto-updating leaderboards with placement points, kills, and WWCD tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-gold/50 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center mb-2">
                <span className="text-destructive text-xl">💀</span>
              </div>
              <CardTitle>Kill Feed</CardTitle>
              <CardDescription>
                Real-time kill notifications with team colors, weapons, and knock/eliminate status
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-gold/50 transition-colors">
            <CardHeader>
              <UsersIcon className="w-10 h-10 text-alive mb-2" />
              <CardTitle>Team Status</CardTitle>
              <CardDescription>
                Live player status tracking - alive, knocked, eliminated with team branding
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-gold/50 transition-colors">
            <CardHeader>
              <SettingsIcon className="w-10 h-10 text-accent mb-2" />
              <CardTitle>OBS Ready</CardTitle>
              <CardDescription>Browser source overlays optimized for streaming software integration</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8 text-center">Overlay Browser Sources</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Link href="/overlay/rankings" className="block">
            <Card className="bg-card border-border hover:border-gold transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <p className="font-medium">Rankings Overlay</p>
                <p className="text-xs text-muted-foreground mt-1">/overlay/rankings</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/overlay/killfeed" className="block">
            <Card className="bg-card border-border hover:border-gold transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <p className="font-medium">Kill Feed</p>
                <p className="text-xs text-muted-foreground mt-1">/overlay/killfeed</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/overlay/teams" className="block">
            <Card className="bg-card border-border hover:border-gold transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <p className="font-medium">Team Status</p>
                <p className="text-xs text-muted-foreground mt-1">/overlay/teams</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/overlay/full" className="block">
            <Card className="bg-card border-border hover:border-gold transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <p className="font-medium">Full Broadcast</p>
                <p className="text-xs text-muted-foreground mt-1">/overlay/full</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>PUBG Live Production System - Built for grassroots esports tournaments</p>
        </div>
      </footer>
    </main>
  )
}
