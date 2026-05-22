"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import getClient from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PlayIcon } from "@/components/icons"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type LoginRole = "admin" | "caster"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<LoginRole>("admin")
  const router = useRouter()

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

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      const session = data.session ?? await waitForAuthSession(supabase)
      if (!session) {
        toast.error("Login succeeded but the auth session could not be established. Please refresh and try again.")
        return
      }

      const mappedRole = selectedRole === "admin"
        ? "director"
        : "caster-locked"

      if (typeof window !== "undefined") {
        localStorage.setItem("pubg_admin_role", mappedRole)
      }

      if (selectedRole === "admin") {
        const checkResponse = await fetch("/api/admin/check", {
          credentials: "same-origin",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (!checkResponse.ok) {
          await supabase.auth.signOut()
          if (typeof window !== "undefined") {
            localStorage.removeItem("pubg_admin_role")
          }
          toast.error("Director access denied. Your email must be listed in public.admins.")
          return
        }
      }

      toast.success(`Successfully logged in as ${selectedRole}!`)
      router.replace("/admin")
    } catch (err: any) {
      toast.error(err.message || "Failed to log in")
    } finally {
      setLoading(false)
    }
  }

  // Supabase Google OAuth (Gmail) Login Handler
  const handleGoogleLogin = async () => {
    try {
      if (typeof window !== "undefined") {
        const mappedRole = selectedRole === "admin"
          ? "director"
          : "caster-locked"
        localStorage.setItem("pubg_admin_role", mappedRole)
      }
      const supabase = getClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      })
      if (error) {
        toast.error(error.message)
      }
    } catch (err: any) {
      toast.error("Failed to initialize Google login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] p-4 relative overflow-hidden select-none">
      
      {/* 1. Cinematic PUBG Mobile Background Image with slow zoom */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 pointer-events-none animate-bg-zoom"
        style={{ backgroundImage: "url('/pubg-background.png')" }}
      />
      
      {/* 2. Protective Contrast Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/85 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(218,175,55,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      {/* 3. High-Tech Gold Spark Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute w-1 h-1 bg-gold rounded-full bottom-[-10px] left-[15%] animate-spark-1" />
        <div className="absolute w-1.5 h-1.5 bg-gold rounded-full bottom-[-10px] left-[45%] animate-spark-2" />
        <div className="absolute w-1 h-1 bg-gold rounded-full bottom-[-10px] left-[75%] animate-spark-3" />
        <div className="absolute w-2 h-2 bg-gold/50 rounded-full bottom-[-10px] left-[85%] animate-spark-1" />
      </div>

      <style>{`
        @keyframes spark-float-1 {
          0% { transform: translateY(100vh) translateX(0) scale(0.6); opacity: 0; }
          30% { opacity: 0.8; }
          100% { transform: translateY(-20vh) translateX(50px) scale(0.2); opacity: 0; }
        }
        @keyframes spark-float-2 {
          0% { transform: translateY(100vh) translateX(0) scale(0.4); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-20vh) translateX(-80px) scale(0.2); opacity: 0; }
        }
        @keyframes spark-float-3 {
          0% { transform: translateY(100vh) translateX(0) scale(0.5); opacity: 0; }
          40% { opacity: 0.9; }
          100% { transform: translateY(-20vh) translateX(30px) scale(0.1); opacity: 0; }
        }
        .animate-spark-1 {
          animation: spark-float-1 14s linear infinite;
        }
        .animate-spark-2 {
          animation: spark-float-2 18s linear infinite;
          animation-delay: 4s;
        }
        .animate-spark-3 {
          animation: spark-float-3 22s linear infinite;
          animation-delay: 8s;
        }
        @keyframes bg-zoom {
          0%, 100% { transform: scale(1.0); }
          50% { transform: scale(1.06); }
        }
        .animate-bg-zoom {
          animation: bg-zoom 40s ease-in-out infinite;
        }
      `}</style>

      {/* 4. Glassmorphic Terminal Card Frame */}
      <Card className="w-full max-w-md z-10 bg-zinc-950/75 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl relative overflow-hidden transition-all duration-500 hover:border-gold/20 hover:shadow-[0_0_40px_rgba(218,165,32,0.15)]">
        
        {/* Sleek top glowing border bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />
        
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30 shadow-[0_0_15px_rgba(218,165,32,0.2)] animate-pulse" style={{ animationDuration: "3s" }}>
              <PlayIcon className="w-6 h-6 text-gold" />
            </div>
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-wider text-white">PUBG Admin Login</CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            Sign in to open the Admin or Caster desk.
          </CardDescription>

          {/* Futuristic Role Selection Tabs */}
          <div className="flex border border-white/5 bg-black/60 rounded-xl p-1 gap-1 mt-4">
            <button
              type="button"
              onClick={() => setSelectedRole("admin")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                selectedRole === "admin" 
                  ? "gradient-gold text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              Admin
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("caster")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                selectedRole === "caster" 
                  ? "gradient-gold text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Caster Desk
            </button>
          </div>
          <p className="text-[10px] text-amber-200/80 uppercase tracking-wide text-center mt-3 px-2">
            Only emails listed in <span className="font-mono text-white">public.admins</span> can use Admin mode. If your account is not an admin, choose Caster Desk.
          </p>
        </CardHeader>

        {/* 1. ADMIN PANEL VIEW */}
        {selectedRole === "admin" && (
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5 px-6 py-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 text-white rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/30 focus:shadow-[0_0_12px_rgba(218,165,32,0.15)] transition-all duration-300 text-sm h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 text-white rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/30 focus:shadow-[0_0_12px_rgba(218,165,32,0.15)] transition-all duration-300 text-sm h-11"
                />
              </div>

            </CardContent>
            
            <CardFooter className="pb-8 pt-3 px-6 flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full gradient-gold text-primary-foreground font-black tracking-widest uppercase rounded-lg h-11 hover:brightness-110 hover:shadow-[0_0_15px_rgba(218,165,32,0.35)] transition-all duration-300 active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In as Admin"}
              </Button>

              {/* Supabase Google OAuth (Gmail) Verification Button */}
              <div className="relative w-full flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                <span className="relative z-10 px-3 bg-[#0c0c14]/90 text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Verification Provider</span>
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg h-11 font-black text-xs uppercase tracking-widest hover:bg-zinc-800 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                {/* Colored Google G logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.427-3.3c-2.2-2.05-5.047-3.3-8.474-3.3C4.856 0 0 4.856 0 10.8s4.856 10.8 10.8 10.8c5.688 0 9.475-3.99 9.475-9.643 0-.65-.074-1.14-.162-1.672h-7.873z" />
                </svg>
                Sign In with Google
              </Button>
            </CardFooter>
          </form>
        )}

        {/* 2. CASTER DESK VIEW */}
        {selectedRole === "caster" && (
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 px-6 py-4">
              <div className="p-4 rounded-xl bg-gold/5 border border-gold/15 text-center space-y-2">
                <p className="text-xs font-bold text-gold uppercase tracking-wider">Caster Desk Access</p>
                <p className="text-[11px] text-muted-foreground">
                  Use caster credentials or Google sign-in for desk access.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Caster Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="caster@esports.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 text-white rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/30 focus:shadow-[0_0_12px_rgba(218,165,32,0.15)] transition-all duration-300 text-sm h-11"
                />
              </div>
               
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Passphrase</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 text-white rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/30 focus:shadow-[0_0_12px_rgba(218,165,32,0.15)] transition-all duration-300 text-sm h-11"
                />
              </div>
            </CardContent>

            <CardFooter className="pb-8 pt-2 px-6 flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full gradient-gold text-primary-foreground font-black tracking-widest uppercase rounded-lg h-11 hover:brightness-110 hover:shadow-[0_0_15px_rgba(218,165,32,0.35)] transition-all duration-300 active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In as Caster"}
              </Button>

              <div className="relative w-full flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                <span className="relative z-10 px-3 bg-[#0c0c14]/90 text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Realtime SSO</span>
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg h-11 font-black text-xs uppercase tracking-widest hover:bg-zinc-800 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.427-3.3c-2.2-2.05-5.047-3.3-8.474-3.3C4.856 0 0 4.856 0 10.8s4.856 10.8 10.8 10.8c5.688 0 9.475-3.99 9.475-9.643 0-.65-.074-1.14-.162-1.672h-7.873z" />
                </svg>
                Sign In with Google
              </Button>
            </CardFooter>
          </form>
        )}

      </Card>
      
    </div>
  )
}
