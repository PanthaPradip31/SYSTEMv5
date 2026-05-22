"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminDashboard;
var card_1 = require("@/components/ui/card");
var store_1 = require("@/lib/store");
var link_1 = require("next/link");
var button_1 = require("@/components/ui/button");
var react_1 = require("react");
var realtime_1 = require("@/lib/realtime");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
// ─── Inline SVG Icons ────────────────────────────────────────────────────────
var TrophyIcon = function (props) { return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
  </svg>); };
var UsersIcon = function (props) { return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>); };
var SkullIcon = function (props) { return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V9a7 7 0 0114 0v10a2 2 0 01-2 2z"/>
  </svg>); };
var ShieldAlertIcon = function (props) { return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
  </svg>); };
var EyeIcon = function (props) { return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>); };
var RefreshCwIcon = function (props) { return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12"/>
  </svg>); };
function AdminDashboard() {
    var _a = (0, store_1.useTeams)(), teams = _a.teams, updateTeam = _a.updateTeam;
    var killFeed = (0, store_1.useKillFeed)().killFeed;
    var _b = (0, react_1.useState)("director"), role = _b[0], setRole = _b[1];
    var _c = (0, react_1.useState)(0.2), scale = _c[0], setScale = _c[1];
    var monitorRef = (0, react_1.useRef)(null);
    // Auto scale listener for live viewport monitor
    (0, react_1.useEffect)(function () {
        var handleResize = function () {
            if (monitorRef.current) {
                setScale(monitorRef.current.clientWidth / 1920);
            }
        };
        handleResize();
        var timer = setTimeout(handleResize, 350);
        window.addEventListener("resize", handleResize);
        return function () {
            window.removeEventListener("resize", handleResize);
            clearTimeout(timer);
        };
    }, [role]);
    (0, react_1.useEffect)(function () {
        if (typeof window !== "undefined") {
            var saved = localStorage.getItem("pubg_admin_role");
            if (saved === "observer") {
                setRole("caster-locked");
            }
            else if (saved === "director" || saved === "caster-locked") {
                setRole(saved);
            }
        }
    }, []);
    // Caster-locked sessions cannot switch to Director — enforced client-side
    var handleRoleChange = function (newRole) {
        if (role === "caster-locked")
            return; // Hard block: casters cannot escalate privileges
        setRole(newRole);
        if (typeof window !== "undefined") {
            localStorage.setItem("pubg_admin_role", newRole);
        }
    };
    // Statistics Calculations
    var totalPlayers = teams.reduce(function (sum, team) { return sum + (team.players || []).filter(function (p) { return !p.isSub; }).length; }, 0);
    var alivePlayers = teams.reduce(function (sum, team) { return sum + (team.players || []).filter(function (p) { return !p.isSub && p.status === "alive"; }).length; }, 0);
    var knockedPlayers = teams.reduce(function (sum, team) { return sum + (team.players || []).filter(function (p) { return !p.isSub && p.status === "knocked"; }).length; }, 0);
    var totalKills = killFeed.filter(function (k) { return !k.isKnock; }).length;
    // Quick Action Triggers (Admin Only)
    var triggerSampleMVP = function () {
        var _a;
        var sampleMVP = {
            playerId: "p-sample-mvp",
            playerName: "PANTHER",
            teamShortName: "NV",
            teamLogo: "/nova-esports-gaming-logo-gold.jpg",
            teamColor: "#F1C40F",
            kills: 14,
            damage: 1850,
            survivalTime: "24:12",
            isWWCD: true,
            playerPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Panther",
        };
        (_a = (0, realtime_1.getRealtimeSync)()) === null || _a === void 0 ? void 0 : _a.broadcast("MVP_REVEAL", sampleMVP);
        sonner_1.toast.success("Broadcast cue: Triggered MVP cinematic stinger!");
    };
    var triggerSampleWWCD = function () {
        var _a;
        (_a = (0, realtime_1.getRealtimeSync)()) === null || _a === void 0 ? void 0 : _a.broadcast("WWCD_TRIGGER", {
            teamId: "team-1",
            teamName: "Nova Esports",
            teamShortName: "NOVA",
            teamColor: "#FFD700",
            totalKills: 18,
            totalPoints: 28,
        });
        sonner_1.toast.success("Broadcast cue: Triggered Chicken Dinner celebration overlay!");
    };
    var triggerSampleEpicKill = function () {
        var _a;
        (_a = (0, realtime_1.getRealtimeSync)()) === null || _a === void 0 ? void 0 : _a.broadcast("ELIMINATION_EPIC", {
            id: "elim-".concat(Date.now()),
            timestamp: new Date(),
            killerId: "t1-p1",
            killerName: "Order",
            killerTeam: "NOVA",
            victimId: "t2-p1",
            victimName: "33Syi",
            victimTeam: "4AM",
            weapon: "AWM",
            isKnock: false,
        });
        sonner_1.toast.success("Broadcast cue: Injected AWM elimination banner feed!");
    };
    var handleResetAliveCounts = function () {
        var _a;
        teams.forEach(function (t) {
            var updatedPlayers = t.players.map(function (p) { return (__assign(__assign({}, p), { status: "alive" })); });
            updateTeam(t.id, { players: updatedPlayers });
        });
        (_a = (0, realtime_1.getRealtimeSync)()) === null || _a === void 0 ? void 0 : _a.broadcast("FORCE_REFRESH", {});
        sonner_1.toast.success("Lobby status: Reset all player counts to alive successfully!");
    };
    var obsSources = [
        { name: "Full Overlay Suite", url: "/overlay/full" },
        { name: "Cinematic Visual FX", url: "/overlay/effects" },
        { name: "Kill Feed Ticker", url: "/overlay/killfeed" },
        { name: "Standings Rankings", url: "/overlay/rankings" },
        { name: "Team Status Bar", url: "/overlay/teams" },
    ];
    return (<div className="p-6 space-y-6 max-w-[1600px] mx-auto relative min-h-screen">
      
      {/* Dynamic Background Layout Grid */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('/pubg-background.png')" }}/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(218,175,55,0.02)_0%,transparent_60%)] pointer-events-none"/>

      {/* Stagger entrance keyframe styles */}
      <style>{"\n        @keyframes card-fade-in {\n          from { opacity: 0; transform: translateY(12px); }\n          to { opacity: 1; transform: translateY(0); }\n        }\n        .stagger-1 { animation: card-fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }\n        .stagger-2 { animation: card-fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 100ms; opacity: 0; }\n        .stagger-3 { animation: card-fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 200ms; opacity: 0; }\n      "}</style>

      {/* ── Role Command Selector ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 stagger-1">
        <div>
          <h1 className="text-3xl font-black tracking-wider uppercase text-white flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-gold rounded shadow-[0_0_8px_rgba(218,165,32,0.5)]"/>
            {role === "director" ? "Broadcast Director Deck" : "Caster Desk"}
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
            {role === "director"
            ? "Superuser console with live interactive stinger animations, database mutations, and overlay controls"
            : "Read-only caster desk showing live telemetry, player vitals, and overlay previews"}
          </p>
        </div>

        {/* Sliding Role Switcher — hidden entirely for caster-locked sessions */}
        {role !== "caster-locked" && (<div className="flex items-center bg-zinc-950 border border-white/5 rounded-xl p-1 shrink-0 relative overflow-hidden self-start md:self-auto shadow-2xl">
            <button onClick={function () { return handleRoleChange("caster-locked"); }} className={"flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ".concat(role === "caster-locked" ? "bg-white/10 text-white shadow-lg" : "text-muted-foreground hover:text-foreground")}>
              <EyeIcon className="w-4 h-4 text-gold"/>
              Caster Desk
            </button>
            <button onClick={function () { return handleRoleChange("director"); }} className={"flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ".concat(role === "director" ? "gradient-gold text-primary-foreground font-black shadow-lg" : "text-muted-foreground hover:text-foreground")}>
              <ShieldAlertIcon className="w-4 h-4"/>
              Director Desk
            </button>
          </div>)}

        {/* Caster-locked badge — shown only for locked caster sessions */}
        {role === "caster-locked" && (<div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 border border-white/5 rounded-xl self-start md:self-auto shadow-2xl">
            <EyeIcon className="w-4 h-4 text-gold"/>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Caster View</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[8px] uppercase font-black tracking-widest text-red-400">Read-Only Locked</span>
          </div>)}
      </div>
 
      {/* ── Live Vitals statistics Panel ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-1">
        
        <card_1.Card className="bg-zinc-950/40 backdrop-blur-md border border-white/5 shadow-xl hover:border-gold/20 hover:shadow-[0_0_20px_rgba(218,165,32,0.06)] transition-all duration-300">
          <card_1.CardHeader className="flex flex-row items-center justify-between pb-2">
            <card_1.CardTitle className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Deployed Teams</card_1.CardTitle>
            <UsersIcon className="w-4 h-4 text-gold"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-3.5xl font-black font-mono text-white tracking-tight">{teams.length}</div>
            <p className="text-[9px] text-muted-foreground tracking-widest uppercase mt-1">
              {totalPlayers} Combatants Active
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-zinc-950/40 backdrop-blur-md border border-white/5 shadow-xl hover:border-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.06)] transition-all duration-300">
          <card_1.CardHeader className="flex flex-row items-center justify-between pb-2">
            <card_1.CardTitle className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Combatants Alive</card_1.CardTitle>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-3.5xl font-black font-mono text-emerald-500 tracking-tight">{alivePlayers}</div>
            <p className="text-[9px] text-muted-foreground tracking-widest uppercase mt-1">
              Of {totalPlayers} active players
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-zinc-950/40 backdrop-blur-md border border-white/5 shadow-xl hover:border-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.06)] transition-all duration-300">
          <card_1.CardHeader className="flex flex-row items-center justify-between pb-2">
            <card_1.CardTitle className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Knocked Down</card_1.CardTitle>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping shadow-[0_0_10px_#f59e0b]"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-3.5xl font-black font-mono text-amber-500 tracking-tight">{knockedPlayers}</div>
            <p className="text-[9px] text-muted-foreground tracking-widest uppercase mt-1">
              Requiring revive
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-zinc-950/40 backdrop-blur-md border border-white/5 shadow-xl hover:border-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.06)] transition-all duration-300">
          <card_1.CardHeader className="flex flex-row items-center justify-between pb-2">
            <card_1.CardTitle className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Total Match Kills</card_1.CardTitle>
            <SkullIcon className="w-4 h-4 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-3.5xl font-black font-mono text-red-500 tracking-tight">{totalKills}</div>
            <p className="text-[9px] text-muted-foreground tracking-widest uppercase mt-1">
              Eliminations recorded
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* ── Caster Desk Dashboard Layout ── */}
      {role === "caster-locked" && (<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 stagger-2">
          
          {/* Hard-locked notice for caster sessions */}
          {role === "caster-locked" && (<div className="xl:col-span-3 p-4 rounded-xl bg-red-500/5 border border-red-500/15 flex items-center gap-3 text-xs stagger-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"/>
              <span className="text-red-400 uppercase font-black tracking-widest text-[10px]">Access Restricted:</span>
              <span className="text-neutral-300">This session is locked to the Caster Observer view. Director controls are disabled for your role.</span>
            </div>)}
          
          {/* Left Column: High Density Telemetry Roster Sheet */}
          <div className="xl:col-span-2 space-y-6">
            <card_1.Card className="bg-zinc-950/45 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl overflow-hidden relative transition-all duration-300 hover:border-white/10">
              <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-40"/>
              <card_1.CardHeader className="border-b border-white/5 bg-black/30">
                <card_1.CardTitle className="text-xs uppercase tracking-widest text-neutral-200 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                  Lobby Combatant Telemetry Matrix
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="p-0 max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-950 text-muted-foreground uppercase text-[9px] font-black tracking-widest border-b border-white/5">
                      <th className="py-3.5 px-5">Team</th>
                      <th className="py-3.5 px-5">Tag</th>
                      <th className="py-3.5 px-5">Combatant</th>
                      <th className="py-3.5 px-5">Vitals</th>
                      <th className="py-3.5 px-5 text-right">Kills</th>
                      <th className="py-3.5 px-5 text-right">Damage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map(function (team) { return (team.players.map(function (p, idx) { return (<tr key={"".concat(team.id, "-").concat(p.id, "-").concat(idx)} className={(0, utils_1.cn)("border-b border-white/5 hover:bg-white/5 transition-colors", idx === 0 ? "border-t border-white/10" : "")}>
                          {idx === 0 ? (<td className="py-3 px-5 font-bold text-neutral-200 align-top" rowSpan={team.players.length}>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="w-1.5 h-6 rounded" style={{ backgroundColor: team.color, boxShadow: "0 0 8px ".concat(team.color) }}/>
                                <span className="truncate max-w-[120px] tracking-wide font-black uppercase text-xs">{team.name}</span>
                              </div>
                            </td>) : null}
                          {idx === 0 ? (<td className="py-3 px-5 font-mono font-black align-top text-xs mt-0.5" style={{ color: team.color }} rowSpan={team.players.length}>
                              {team.shortName}
                            </td>) : null}
                          <td className="py-3.5 px-5 font-bold text-neutral-300 tracking-wide text-xs">{p.name}</td>
                          <td className="py-3.5 px-5">
                            <span className={(0, utils_1.cn)("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider", p.status === "alive"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : p.status === "knocked"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                        : "bg-red-500/10 text-red-400 border border-red-500/20")}>
                              <span className={(0, utils_1.cn)("w-1 h-1 rounded-full", p.status === "alive" ? "bg-emerald-400" : p.status === "knocked" ? "bg-amber-400 animate-ping" : "bg-red-400")}/>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right font-mono font-black text-xs text-white">{p.kills}</td>
                          <td className="py-3.5 px-5 text-right font-mono font-bold text-muted-foreground text-xs">{p.damage}</td>
                        </tr>); })); })}
                    {teams.length === 0 && (<tr>
                        <td colSpan={6} className="text-center py-12 text-muted-foreground uppercase font-bold tracking-widest text-[10px]">
                          No active combatant telemetry configured
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Right Column: Live scaled viewport monitor & scroll ticker */}
          <div className="space-y-6">
            
            {/* Realtime scaled preview monitor */}
            <card_1.Card className="bg-zinc-950/45 backdrop-blur-md border border-white/5 shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
              <div className="h-[2px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"/>
              <card_1.CardHeader className="pb-3 border-b border-white/5 bg-black/30">
                <card_1.CardTitle className="text-xs uppercase font-bold tracking-wider text-glow flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_red]"/>
                    Live Overlay Output Preview
                  </span>
                  <span className="text-[9px] bg-red-950/50 text-red-400 border border-red-500/20 px-2 py-0.5 rounded uppercase font-black tracking-widest">OBS Sync</span>
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="pt-4">
                <div ref={monitorRef} className="w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden border border-white/10 relative shadow-2xl">
                  <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]"/>
                  <iframe src="/overlay/effects" className="absolute inset-0 border-0 origin-top-left pointer-events-none" style={{
                transform: "scale(".concat(scale, ")"),
                width: "1920px",
                height: "1080px",
            }}/>
                </div>
                <p className="text-[9px] text-muted-foreground text-center mt-3.5 uppercase tracking-widest font-black">
                  Active Visual Effects Channel (/overlay/effects)
                </p>
              </card_1.CardContent>
            </card_1.Card>

            {/* Scroll elimination ticker */}
            <card_1.Card className="bg-zinc-950/45 backdrop-blur-md border border-white/5 shadow-xl hover:border-white/10 transition-all duration-300">
              <card_1.CardHeader className="border-b border-white/5 bg-black/30 pb-3">
                <card_1.CardTitle className="text-xs uppercase font-bold tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  Realtime Combat Kill Feed
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="pt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-2">
                {killFeed.map(function (k) { return (<div key={k.id} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl text-xs hover:border-white/10 transition-all shadow-inner">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-black text-red-400 tracking-wide text-xs">{k.killerTeam} • {k.killerName}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded border border-white/5">
                        {k.weapon}
                      </span>
                      <span className="font-bold text-neutral-400 truncate text-xs">{k.victimTeam} • {k.victimName}</span>
                    </div>
                    <span className={(0, utils_1.cn)("text-[9px] uppercase font-black font-mono tracking-widest pl-2 shrink-0 px-2 py-0.5 rounded-full border", k.isKnock
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20")}>
                      {k.isKnock ? "Knocked" : "Wiped"}
                    </span>
                  </div>); })}
                {killFeed.length === 0 && (<div className="text-center py-8 text-[9px] text-muted-foreground uppercase font-black tracking-widest p-4 rounded-xl border border-white/5 bg-black/20">
                    Awaiting tactical engagements...
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </div>)}

      {/* ── Director (Admin) Dashboard Layout ── */}
      {role === "director" && (<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 stagger-2">
          
          {/* Left Column: Triggers, Settings, Actions */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Quick Actions Router */}
            <card_1.Card className="bg-zinc-950/45 backdrop-blur-md border border-white/5 shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
              <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-40"/>
              <card_1.CardHeader className="bg-black/30 border-b border-white/5">
                <card_1.CardTitle className="text-xs uppercase tracking-widest text-white font-black">Director Control Center Channels</card_1.CardTitle>
                <card_1.CardDescription className="text-[10px] uppercase tracking-wider text-white/80 font-bold mt-0.5">Tactical setup panels and operational dashboard routing</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4">
                <link_1.default href="/admin/match" className="block">
                  <button_1.Button className="w-full h-14 justify-start gap-3 bg-zinc-900 border border-white/5 hover:border-gold/30 hover:bg-gold/5 text-white hover:text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-xl relative pl-4 hover:shadow-[0_0_12px_rgba(218,165,32,0.06)] active:scale-[0.98]">
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-gold rounded-r"/>
                    🎮 Live Match HUD
                  </button_1.Button>
                </link_1.default>
                <link_1.default href="/admin/teams" className="block">
                  <button_1.Button className="w-full h-14 justify-start gap-3 bg-zinc-900 border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 text-white hover:text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-xl relative pl-4 hover:shadow-[0_0_12px_rgba(168,85,247,0.06)] active:scale-[0.98]">
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-purple-500 rounded-r"/>
                    ⚔️ Tactical Rosters
                  </button_1.Button>
                </link_1.default>
                <link_1.default href="/admin/overlays" className="block">
                  <button_1.Button className="w-full h-14 justify-start gap-3 bg-zinc-900 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 text-white hover:text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-xl relative pl-4 hover:shadow-[0_0_12px_rgba(6,182,212,0.06)] active:scale-[0.98]">
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-500 rounded-r"/>
                    🔴 Monitor Overlays
                  </button_1.Button>
                </link_1.default>
              </card_1.CardContent>
            </card_1.Card>

            {/* Broadcast Stinger Action Deck */}
            <card_1.Card className="bg-zinc-950/45 backdrop-blur-md border border-white/5 shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
              <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-40"/>
              <card_1.CardHeader className="bg-black/30 border-b border-white/5">
                <card_1.CardTitle className="text-xs uppercase tracking-widest text-neutral-200">Esports Stinger FX Trigger Deck</card_1.CardTitle>
                <card_1.CardDescription className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Fire animated stinger widgets instantly to your OBS browser canvases</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="grid grid-cols-3 gap-4 pt-4">
                <button_1.Button onClick={triggerSampleMVP} className="gradient-gold text-primary-foreground font-black text-[10px] tracking-widest uppercase h-12 hover:brightness-110 hover:shadow-[0_0_15px_rgba(218,165,32,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl">
                  🏆 Trigger MVP stinger
                </button_1.Button>
                <button_1.Button onClick={triggerSampleWWCD} className="bg-[#d97706] hover:bg-[#b45309] text-white font-black text-[10px] tracking-widest uppercase h-12 hover:shadow-[0_0_15px_rgba(217,119,6,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl border border-amber-500/30">
                  🍗 Trigger WWCD stinger
                </button_1.Button>
                <button_1.Button onClick={triggerSampleEpicKill} className="bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-black text-[10px] tracking-widest uppercase h-12 hover:shadow-[0_0_15px_rgba(153,27,27,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl border border-red-500/30">
                  💀 Trigger Epic Wipe
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>

            {/* Lobby Data Master commands */}
            <card_1.Card className="bg-zinc-950/45 backdrop-blur-md border border-white/5 shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
              <div className="h-[2px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"/>
              <card_1.CardHeader className="bg-black/30 border-b border-white/5">
                <card_1.CardTitle className="text-xs uppercase tracking-widest text-red-400 font-bold">Lobby Database Override Knobs</card_1.CardTitle>
                <card_1.CardDescription className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Emergency database overrides to reset standings metrics and wipe channels</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="flex flex-wrap gap-3 pt-4">
                <button_1.Button variant="outline" onClick={handleResetAliveCounts} className="border-red-950 text-red-400 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest gap-2 h-11 px-5 rounded-xl hover:border-red-500 transition-all duration-300 active:scale-[0.98]">
                  <RefreshCwIcon className="w-4 h-4 animate-spin-slow"/>
                  Reset Player HP Vitals
                </button_1.Button>
                <button_1.Button variant="outline" onClick={function () { var _a; return (_a = (0, realtime_1.getRealtimeSync)()) === null || _a === void 0 ? void 0 : _a.broadcast("FORCE_REFRESH", {}); }} className="border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest h-11 px-5 rounded-xl transition-all duration-300 active:scale-[0.98]">
                  Force Sync Broadcast channels
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Right Column: OBS Browser Sources */}
          <div className="space-y-6">
            <card_1.Card className="bg-zinc-950/45 backdrop-blur-md border border-white/5 shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
              <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"/>
              <card_1.CardHeader className="bg-black/30 border-b border-white/5">
                <card_1.CardTitle className="text-xs uppercase tracking-widest text-neutral-200 font-bold flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 10.742l-3.322 1.66A1 1 0 004.8 13.292v3.415a1 1 0 001.555.832l3.323-2.132a1 1 0 00.41-.832v-3.415a1 1 0 00-.404-.813z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.5V3m0 1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 15v1.5m0-1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM20 12a8 8 0 11-16 0 8 8 0 0116 0z"/></svg>
                  OBS Studio Browser Feeds
                </card_1.CardTitle>
                <card_1.CardDescription className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Copy ultra-low latency graphic widgets into your OBS canvases</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4 pt-4">
                {obsSources.map(function (source) { return (<div key={source.url} className="space-y-2 p-3 bg-zinc-950 border border-white/5 rounded-xl hover:border-white/10 transition-all shadow-inner">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-neutral-200">{source.name}</span>
                      <span className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">1920x1080</span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <input value={"".concat(typeof window !== "undefined" ? window.location.origin : "").concat(source.url)} readOnly className="text-[9px] h-8 bg-black/60 border border-white/5 px-2.5 rounded-lg flex-1 font-mono select-all text-neutral-400 focus:outline-none"/>
                      <button_1.Button variant="secondary" size="sm" onClick={function () {
                    navigator.clipboard.writeText("".concat(window.location.origin).concat(source.url));
                    sonner_1.toast.success("Copied URL for ".concat(source.name, "!"));
                }} className="h-8 text-[9px] uppercase font-black shrink-0 px-3 bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all rounded-lg active:scale-[0.96]">
                        Copy
                      </button_1.Button>
                    </div>
                  </div>); })}
              </card_1.CardContent>
            </card_1.Card>
          </div>

        </div>)}

    </div>);
}
