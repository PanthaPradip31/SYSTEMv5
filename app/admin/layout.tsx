"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import getClient from "@/utils/supabase/client"
import { AdminSidebar } from "@/components/admin/sidebar"
import { PlayIcon } from "@/components/icons"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<"director" | "caster-locked" | null | undefined>(undefined)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("pubg_admin_role") as "director" | "observer" | "caster-locked" | null
      if (storedRole === "observer") {
        setRole("caster-locked")
      } else if (storedRole === "director" || storedRole === "caster-locked") {
        setRole(storedRole)
      } else {
        setRole(null)
      }
    }
  }, [])

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const waitForAuthSession = async (supabase: ReturnType<typeof getClient>) => {
    for (let i = 0; i < 8; i += 1) {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session ?? null
      if (session) return session
      await sleep(250)
    }
    return null
  }

  useEffect(() => {
    // Exempt login page from authorization check to prevent loops
    if (pathname === "/admin/login") {
      setAuthorized(true)
      setLoading(false)
      return
    }

    if (role === undefined) {
      // Wait until localStorage role is loaded before checking session.
      return
    }

    async function checkSession() {
      try {
        const supabase = getClient()
        const session = await waitForAuthSession(supabase)

        if (!session) {
          router.replace("/admin/login")
          return
        }

        if (role === "director") {
          const headers: Record<string, string> = {}
          if (session.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`
          }

          const res = await fetch('/api/admin/check', {
            credentials: 'same-origin',
            headers,
          })

          if (res.ok) {
            setAuthorized(true)
          } else {
            if (typeof window !== "undefined") {
              localStorage.removeItem("pubg_admin_role")
            }
            router.replace('/admin/login')
          }
        } else if (role) {
          setAuthorized(true)
        } else {
          router.replace("/admin/login")
        }
      } catch (error) {
        router.replace("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [pathname, router, role])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 select-none">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
          <PlayIcon className="w-6 h-6 text-gold animate-pulse" />
        </div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest animate-pulse">
          Validating Secure Session...
        </p>
      </div>
    )
  }

  // Hide intermediate flashes for unauthorized redirection
  if (!authorized) return null

  // Render login screen cleanly without the dashboard sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
