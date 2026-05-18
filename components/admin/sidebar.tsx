"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { TrophyIcon, SettingsIcon, UsersIcon, MapIcon, PlayIcon, ChartIcon, CrosshairIcon, PauseIcon } from "@/components/icons"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: PlayIcon },
  { href: "/admin/tournament", label: "Tournament", icon: TrophyIcon },
  { href: "/admin/teams", label: "Teams", icon: UsersIcon },
  { href: "/admin/match", label: "Live Match", icon: MapIcon },
  { href: "/admin/starting", label: "Intro Screen", icon: PauseIcon },
  { href: "/admin/overlays", label: "Overlays", icon: SettingsIcon },
  { href: "/admin/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/admin/effects", label: "Effects", icon: CrosshairIcon },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
            <span className="text-primary-foreground font-black text-lg">P</span>
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">PUBG Live</h1>
            <p className="text-xs text-muted-foreground">Production System</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                "text-sidebar-foreground hover:bg-sidebar-accent",
                isActive && "bg-sidebar-accent text-sidebar-primary",
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-gold")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-alive animate-pulse" />
          <span>System Online</span>
        </div>
      </div>
    </aside>
  )
}
