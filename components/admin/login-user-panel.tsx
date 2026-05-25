"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const PREVIEW_FEATURES = ["Live Standings", "Squad Viewer", "Kill Feed", "Match Stats"]

export function LoginUserPanel() {
  const router = useRouter()

  return (
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

      <div className="relative flex flex-col items-center justify-center py-6 select-none">
        <div className="absolute bottom-8 left-[30%] w-4 h-4 rounded-full bg-amber-500/20 dust-1" />
        <div className="absolute bottom-8 left-[50%] w-3 h-3 rounded-full bg-gold/15 dust-2" />
        <div className="absolute bottom-8 left-[65%] w-5 h-5 rounded-full bg-amber-600/10 dust-3" />

        <div className="scaff-bob">
          <svg width="120" height="110" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="70" width="60" height="6" rx="2" fill="#D4AF37" opacity="0.8"/>
            <rect x="38" y="50" width="4" height="22" rx="1" fill="#D4AF37" opacity="0.7"/>
            <rect x="78" y="50" width="4" height="22" rx="1" fill="#D4AF37" opacity="0.7"/>
            <rect x="30" y="50" width="60" height="5" rx="2" fill="#D4AF37" opacity="0.75"/>
            <rect x="38" y="30" width="4" height="22" rx="1" fill="#D4AF37" opacity="0.6"/>
            <rect x="78" y="30" width="4" height="22" rx="1" fill="#D4AF37" opacity="0.6"/>
            <rect x="30" y="30" width="60" height="5" rx="2" fill="#D4AF37" opacity="0.7"/>
            <rect x="40" y="55" width="16" height="14" rx="1" fill="#18181B" stroke="#D4AF37" strokeWidth="0.8" opacity="0.9"/>
            <rect x="62" y="55" width="16" height="14" rx="1" fill="#18181B" stroke="#D4AF37" strokeWidth="0.8" opacity="0.9"/>
            <rect x="40" y="36" width="16" height="13" rx="1" fill="#18181B" stroke="#D4AF37" strokeWidth="0.8" opacity="0.7"/>
            <g className="crane-swing">
              <rect x="56" y="4" width="3" height="30" rx="1" fill="#F59E0B" opacity="0.9"/>
              <rect x="40" y="4" width="22" height="3" rx="1" fill="#F59E0B" opacity="0.9"/>
              <line x1="44" y1="7" x2="44" y2="24" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 2"/>
              <circle cx="44" cy="26" r="2.5" fill="none" stroke="#D4AF37" strokeWidth="1.5"/>
            </g>
            <circle cx="58" cy="4" r="3" fill="#EF4444" opacity="0.9" className="blink-hard"/>
            <line x1="10" y1="78" x2="110" y2="78" stroke="#3F3F46" strokeWidth="1.5"/>
          </svg>
        </div>

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

        <div className="w-full mt-5 bg-zinc-900 border border-white/5 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gold via-amber-400 to-gold rounded-full progress-bar shadow-[0_0_8px_rgba(218,165,32,0.4)]" style={{ width: 0 }} />
        </div>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1.5 font-bold">82% Complete — Coming Soon</p>

        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {PREVIEW_FEATURES.map((feat) => (
            <span key={feat} className="px-2.5 py-1 rounded-full bg-zinc-900 border border-white/5 text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
              {feat}
            </span>
          ))}
        </div>
      </div>

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
  )
}
