"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
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

  useEffect(() => {
    // Exempt login page from authorization check to prevent loops
    if (pathname === "/admin/login") {
      setAuthorized(true)
      setLoading(false)
      return
    }

    async function checkSession() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getSession()
        const session = data?.session

        if (error) {
          console.error("Supabase auth session error:", error)
          await supabase.auth.signOut()
          router.replace("/admin/login")
          return
        }

        if (!session) {
          router.replace("/admin/login")
        } else {
          setAuthorized(true)
        }
      } catch (error) {
        console.error("Supabase session check failed:", error)
        router.replace("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [pathname, router])

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
