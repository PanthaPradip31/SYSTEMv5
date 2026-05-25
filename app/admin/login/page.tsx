"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PlayIcon } from "@/components/icons"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type LoginRole = "admin" | "observer" | "user"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<LoginRole>("admin")
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setAuthError(null)
  }, [selectedRole])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const normalized = error.message || "Authentication failed"
        const message = /invalid login credentials|invalid password|invalid email|user not found|email not found/i.test(normalized)
          ? "Invalid email or password. Please try again."
          : normalized

        setAuthError(message)
        setPassword("")
        toast.error(message)
      } else if (data.session) {
        // ── Role-lock: persist role BEFORE redirect so dashboard reads it instantly ──
        if (typeof window !== "undefined") {
          const mappedRole = selectedRole === "admin" ? "director" : "caster-locked"
          localStorage.setItem("pubg_admin_role", mappedRole)
        }
        toast.success(`Successfully logged in as ${selectedRole}!`)
        router.push("/admin")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log in")
    } finally {
      setLoading(false)
    }
  }

  // Supabase Google OAuth (Gmail) Login Handler
  const handleGoogleLogin = async () => {
    if (typeof window === "undefined") return

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      toast.error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.")
      return
    }

    const mappedRole = selectedRole === "admin" ? "director" : "observer"
    localStorage.setItem("pubg_admin_role", mappedRole)

    const redirectTo = `${window.location.origin}/admin`

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      })

      if (error) {
        console.error("Google OAuth error:", error)
        toast.error(error.message || "Google login failed.")
        return
      }

      if (data?.url) {
        window.location.assign(data.url)
      }
    } catch (err: any) {
      console.error("Failed to initialize Google login:", err)
      toast.error(err?.message || "Failed to initialize Google login")
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
          <CardTitle className="text-2xl font-black uppercase tracking-wider text-white">Lobby Center</CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            Tournament Live Production Systems
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
              onClick={() => setSelectedRole("observer")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                selectedRole === "observer" 
                  ? "gradient-gold text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Caster
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("user")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                selectedRole === "user" 
                  ? "gradient-gold text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              User
            </button>
          </div>
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
                  placeholder="director@esports.com"
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
                {authError && (
                  <p className="text-xs text-destructive mt-1">{authError}</p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="pb-8 pt-3 px-6 flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full gradient-gold text-primary-foreground font-black tracking-widest uppercase rounded-lg h-11 hover:brightness-110 hover:shadow-[0_0_15px_rgba(218,165,32,0.35)] transition-all duration-300 active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? "Decrypting..." : "Connect Production Deck"}
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
                Sign In with Google (Gmail)
              </Button>
            </CardFooter>
          </form>
        )}

        {/* 2. CASTER / OBSERVER PANEL VIEW */}
        {selectedRole === "observer" && (
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 px-6 py-4">
              <div className="p-4 rounded-xl bg-gold/5 border border-gold/15 text-center space-y-2">
                <p className="text-xs font-bold text-gold uppercase tracking-wider">Commentator Telemetry Access</p>
                <p className="text-[11px] text-muted-foreground">
                  Login using your secure caster credentials, or sync instantly using your Google verification account.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Caster Account</Label>
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
                {authError && (
                  <p className="text-xs text-destructive mt-1">{authError}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="pb-8 pt-2 px-6 flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full gradient-gold text-primary-foreground font-black tracking-widest uppercase rounded-lg h-11 hover:brightness-110 hover:shadow-[0_0_15px_rgba(218,165,32,0.35)] transition-all duration-300 active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? "Connecting..." : "Initialize Commentator Panel"}
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
                Verify via Gmail (Google)
              </Button>
            </CardFooter>
          </form>
        )}

        {/* 3. USER / PLAYER VIEW — Animated Under Construction Splash */}
        {selectedRole === "user" && (
          <div className="space-y-0 px-6 py-4">
            <style>{`
              @keyframes scaff-bob {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-6px); }
              }
              @keyframes crane-swing {
                0%, 100% { transform: rotate(-4deg); transform-origin: top center; }
                50% { transform: rotate(4deg); transform-origin: top center; }
              }
              @keyframes dust-rise {
                0% { transform: translateY(0) scale(1); opacity: 0.6; }
                100% { transform: translateY(-40px) scale(2.5); opacity: 0; }
              }
              @keyframes blink-hard {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.2; }
              }
              @keyframes progress-fill {
                0% { width: 0%; }
                40% { width: 60%; }
                70% { width: 75%; }
                90% { width: 82%; }
                100% { width: 82%; }
              }
              @keyframes dot-bounce {
                0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                40% { transform: translateY(-6px); opacity: 1; }
              }
              .dot-1 { animation: dot-bounce 1.4s ease-in-out infinite; animation-delay: 0s; }
              .dot-2 { animation: dot-bounce 1.4s ease-in-out infinite; animation-delay: 0.2s; }
              .dot-3 { animation: dot-bounce 1.4s ease-in-out infinite; animation-delay: 0.4s; }
              .scaff-bob { animation: scaff-bob 2.4s ease-in-out infinite; }
              .crane-swing { animation: crane-swing 3s ease-in-out infinite; }
              .dust-1 { animation: dust-rise 3s ease-out infinite; animation-delay: 0s; }
              .dust-2 { animation: dust-rise 3s ease-out infinite; animation-delay: 1s; }
              .dust-3 { animation: dust-rise 3s ease-out infinite; animation-delay: 2s; }
              .blink-hard { animation: blink-hard 1s step-end infinite; }
              .progress-bar { animation: progress-fill 4s ease-out forwards; }
            `}</style>

            {/* Construction Scene SVG */}
            <div className="relative flex flex-col items-center justify-center py-6 select-none">

              {/* Dust Particles */}
              <div className="absolute bottom-8 left-[30%] w-4 h-4 rounded-full bg-amber-500/20 dust-1" />
              <div className="absolute bottom-8 left-[50%] w-3 h-3 rounded-full bg-gold/15 dust-2" />
              <div className="absolute bottom-8 left-[65%] w-5 h-5 rounded-full bg-amber-600/10 dust-3" />

              {/* Crane + Scaffolding SVG */}
              <div className="scaff-bob">
                <svg width="120" height="110" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Base scaffolding */}
                  <rect x="30" y="70" width="60" height="6" rx="2" fill="#D4AF37" opacity="0.8"/>
                  <rect x="38" y="50" width="4" height="22" rx="1" fill="#D4AF37" opacity="0.7"/>
                  <rect x="78" y="50" width="4" height="22" rx="1" fill="#D4AF37" opacity="0.7"/>
                  <rect x="30" y="50" width="60" height="5" rx="2" fill="#D4AF37" opacity="0.75"/>
                  <rect x="38" y="30" width="4" height="22" rx="1" fill="#D4AF37" opacity="0.6"/>
                  <rect x="78" y="30" width="4" height="22" rx="1" fill="#D4AF37" opacity="0.6"/>
                  <rect x="30" y="30" width="60" height="5" rx="2" fill="#D4AF37" opacity="0.7"/>
                  {/* Building blocks */}
                  <rect x="40" y="55" width="16" height="14" rx="1" fill="#18181B" stroke="#D4AF37" strokeWidth="0.8" opacity="0.9"/>
                  <rect x="62" y="55" width="16" height="14" rx="1" fill="#18181B" stroke="#D4AF37" strokeWidth="0.8" opacity="0.9"/>
                  <rect x="40" y="36" width="16" height="13" rx="1" fill="#18181B" stroke="#D4AF37" strokeWidth="0.8" opacity="0.7"/>
                  {/* Crane arm */}
                  <g className="crane-swing">
                    <rect x="56" y="4" width="3" height="30" rx="1" fill="#F59E0B" opacity="0.9"/>
                    <rect x="40" y="4" width="22" height="3" rx="1" fill="#F59E0B" opacity="0.9"/>
                    {/* Hook cable */}
                    <line x1="44" y1="7" x2="44" y2="24" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 2"/>
                    <circle cx="44" cy="26" r="2.5" fill="none" stroke="#D4AF37" strokeWidth="1.5"/>
                  </g>
                  {/* Warning light on crane */}
                  <circle cx="58" cy="4" r="3" fill="#EF4444" opacity="0.9" className="blink-hard"/>
                  {/* Ground line */}
                  <line x1="10" y1="78" x2="110" y2="78" stroke="#3F3F46" strokeWidth="1.5"/>
                </svg>
              </div>

              {/* Status Text */}
              <div className="text-center space-y-1 mt-2">
                <p className="text-base font-black uppercase tracking-widest text-white flex items-center justify-center gap-1">
                  Building
                  <span className="dot-1 inline-block w-1.5 h-1.5 rounded-full bg-gold mx-0.5" />
                  <span className="dot-2 inline-block w-1.5 h-1.5 rounded-full bg-gold mx-0.5" />
                  <span className="dot-3 inline-block w-1.5 h-1.5 rounded-full bg-gold mx-0.5" />
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  User Panel is Under Active Development
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full mt-5 bg-zinc-900 border border-white/5 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gold via-amber-400 to-gold rounded-full progress-bar shadow-[0_0_8px_rgba(218,165,32,0.4)]" style={{ width: 0 }} />
              </div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1.5 font-bold">82% Complete — Coming Soon</p>

              {/* Feature Preview Tags */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {["Live Standings", "Squad Viewer", "Kill Feed", "Match Stats"].map((feat) => (
                  <span key={feat} className="px-2.5 py-1 rounded-full bg-zinc-900 border border-white/5 text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Back to home button */}
            <div className="pb-6">
              <Button
                onClick={() => router.push("/")}
                className="w-full gradient-gold text-primary-foreground font-black tracking-widest uppercase rounded-lg h-11 hover:brightness-110 hover:shadow-[0_0_15px_rgba(218,165,32,0.35)] transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Return to Public Lobby
              </Button>
            </div>
          </div>
        )}


      </Card>
      
    </div>
  )
}
