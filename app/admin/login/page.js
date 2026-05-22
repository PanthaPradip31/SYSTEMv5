"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminLogin;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var client_1 = require("@/utils/supabase/client");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var label_1 = require("@/components/ui/label");
var icons_1 = require("@/components/icons");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
function AdminLogin() {
    var _this = this;
    var _a = (0, react_1.useState)(""), email = _a[0], setEmail = _a[1];
    var _b = (0, react_1.useState)(""), password = _b[0], setPassword = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)("admin"), selectedRole = _d[0], setSelectedRole = _d[1];
    var router = (0, navigation_1.useRouter)();
    var sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
    var waitForAuthSession = function (supabase) { return __awaiter(_this, void 0, void 0, function () {
        var i, sessionData, session;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i < 8)) return [3 /*break*/, 5];
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    sessionData = (_b.sent()).data;
                    session = (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) !== null && _a !== void 0 ? _a : null;
                    if (session)
                        return [2 /*return*/, session];
                    return [4 /*yield*/, sleep(250)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    i += 1;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, null];
            }
        });
    }); };
    var handleLogin = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var supabase, _a, data, error, session, _b, mappedRole, checkResponse, err_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 9, 10, 11]);
                    supabase = (0, client_1.default)();
                    return [4 /*yield*/, supabase.auth.signInWithPassword({
                            email: email,
                            password: password,
                        })];
                case 2:
                    _a = _d.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        sonner_1.toast.error(error.message);
                        return [2 /*return*/];
                    }
                    if (!((_c = data.session) !== null && _c !== void 0)) return [3 /*break*/, 3];
                    _b = _c;
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, waitForAuthSession(supabase)];
                case 4:
                    _b = _d.sent();
                    _d.label = 5;
                case 5:
                    session = _b;
                    if (!session) {
                        sonner_1.toast.error("Login succeeded but the auth session could not be established. Please refresh and try again.");
                        return [2 /*return*/];
                    }
                    mappedRole = selectedRole === "admin"
                        ? "director"
                        : "caster-locked";
                    if (typeof window !== "undefined") {
                        localStorage.setItem("pubg_admin_role", mappedRole);
                    }
                    if (!(selectedRole === "admin")) return [3 /*break*/, 8];
                    return [4 /*yield*/, fetch("/api/admin/check", {
                            credentials: "same-origin",
                            headers: {
                                Authorization: "Bearer ".concat(session.access_token),
                            },
                        })];
                case 6:
                    checkResponse = _d.sent();
                    if (!!checkResponse.ok) return [3 /*break*/, 8];
                    return [4 /*yield*/, supabase.auth.signOut()];
                case 7:
                    _d.sent();
                    sonner_1.toast.error("This account is not authorized for director access.");
                    return [2 /*return*/];
                case 8:
                    sonner_1.toast.success("Successfully logged in as ".concat(selectedRole, "!"));
                    router.replace("/admin");
                    return [3 /*break*/, 11];
                case 9:
                    err_1 = _d.sent();
                    sonner_1.toast.error(err_1.message || "Failed to log in");
                    return [3 /*break*/, 11];
                case 10:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    }); };
    // Supabase Google OAuth (Gmail) Login Handler
    var handleGoogleLogin = function () { return __awaiter(_this, void 0, void 0, function () {
        var mappedRole, supabase, error, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (typeof window !== "undefined") {
                        mappedRole = selectedRole === "admin"
                            ? "director"
                            : "caster-locked";
                        localStorage.setItem("pubg_admin_role", mappedRole);
                    }
                    supabase = (0, client_1.default)();
                    return [4 /*yield*/, supabase.auth.signInWithOAuth({
                            provider: "google",
                            options: {
                                redirectTo: "".concat(window.location.origin, "/admin"),
                            },
                        })];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        sonner_1.toast.error(error.message);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    sonner_1.toast.error("Failed to initialize Google login");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen flex items-center justify-center bg-[#050508] p-4 relative overflow-hidden select-none">
      
      {/* 1. Cinematic PUBG Mobile Background Image with slow zoom */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 pointer-events-none animate-bg-zoom" style={{ backgroundImage: "url('/pubg-background.png')" }}/>
      
      {/* 2. Protective Contrast Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/85 pointer-events-none"/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(218,175,55,0.1)_0%,transparent_70%)] pointer-events-none"/>
      
      {/* 3. High-Tech Gold Spark Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute w-1 h-1 bg-gold rounded-full bottom-[-10px] left-[15%] animate-spark-1"/>
        <div className="absolute w-1.5 h-1.5 bg-gold rounded-full bottom-[-10px] left-[45%] animate-spark-2"/>
        <div className="absolute w-1 h-1 bg-gold rounded-full bottom-[-10px] left-[75%] animate-spark-3"/>
        <div className="absolute w-2 h-2 bg-gold/50 rounded-full bottom-[-10px] left-[85%] animate-spark-1"/>
      </div>

      <style>{"\n        @keyframes spark-float-1 {\n          0% { transform: translateY(100vh) translateX(0) scale(0.6); opacity: 0; }\n          30% { opacity: 0.8; }\n          100% { transform: translateY(-20vh) translateX(50px) scale(0.2); opacity: 0; }\n        }\n        @keyframes spark-float-2 {\n          0% { transform: translateY(100vh) translateX(0) scale(0.4); opacity: 0; }\n          50% { opacity: 1; }\n          100% { transform: translateY(-20vh) translateX(-80px) scale(0.2); opacity: 0; }\n        }\n        @keyframes spark-float-3 {\n          0% { transform: translateY(100vh) translateX(0) scale(0.5); opacity: 0; }\n          40% { opacity: 0.9; }\n          100% { transform: translateY(-20vh) translateX(30px) scale(0.1); opacity: 0; }\n        }\n        .animate-spark-1 {\n          animation: spark-float-1 14s linear infinite;\n        }\n        .animate-spark-2 {\n          animation: spark-float-2 18s linear infinite;\n          animation-delay: 4s;\n        }\n        .animate-spark-3 {\n          animation: spark-float-3 22s linear infinite;\n          animation-delay: 8s;\n        }\n        @keyframes bg-zoom {\n          0%, 100% { transform: scale(1.0); }\n          50% { transform: scale(1.06); }\n        }\n        .animate-bg-zoom {\n          animation: bg-zoom 40s ease-in-out infinite;\n        }\n      "}</style>

      {/* 4. Glassmorphic Terminal Card Frame */}
      <card_1.Card className="w-full max-w-md z-10 bg-zinc-950/75 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl relative overflow-hidden transition-all duration-500 hover:border-gold/20 hover:shadow-[0_0_40px_rgba(218,165,32,0.15)]">
        
        {/* Sleek top glowing border bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-80"/>
        
        <card_1.CardHeader className="space-y-1 text-center pt-8">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30 shadow-[0_0_15px_rgba(218,165,32,0.2)] animate-pulse" style={{ animationDuration: "3s" }}>
              <icons_1.PlayIcon className="w-6 h-6 text-gold"/>
            </div>
          </div>
          <card_1.CardTitle className="text-2xl font-black uppercase tracking-wider text-white">Lobby Center</card_1.CardTitle>
          <card_1.CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            Tournament Live Production Systems
          </card_1.CardDescription>

          {/* Futuristic Role Selection Tabs */}
          <div className="flex border border-white/5 bg-black/60 rounded-xl p-1 gap-1 mt-4">
            <button type="button" onClick={function () { return setSelectedRole("admin"); }} className={(0, utils_1.cn)("flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300", selectedRole === "admin"
            ? "gradient-gold text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-white")}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              Admin
            </button>
            <button type="button" onClick={function () { return setSelectedRole("caster"); }} className={(0, utils_1.cn)("flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300", selectedRole === "caster"
            ? "gradient-gold text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-white")}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Caster Desk
            </button>
          </div>
        </card_1.CardHeader>

        {/* 1. ADMIN PANEL VIEW */}
        {selectedRole === "admin" && (<form onSubmit={handleLogin}>
            <card_1.CardContent className="space-y-5 px-6 py-2">
              <div className="space-y-2">
                <label_1.Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Admin Email</label_1.Label>
                <input_1.Input id="email" type="email" placeholder="admin@gmail.com" value={email} onChange={function (e) { return setEmail(e.target.value); }} required className="bg-black/50 border-white/10 text-white rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/30 focus:shadow-[0_0_12px_rgba(218,165,32,0.15)] transition-all duration-300 text-sm h-11"/>
              </div>
              
              <div className="space-y-2">
                <label_1.Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Password</label_1.Label>
                <input_1.Input id="password" type="password" placeholder="••••••••" value={password} onChange={function (e) { return setPassword(e.target.value); }} required className="bg-black/50 border-white/10 text-white rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/30 focus:shadow-[0_0_12px_rgba(218,165,32,0.15)] transition-all duration-300 text-sm h-11"/>
              </div>

            </card_1.CardContent>
            
            <card_1.CardFooter className="pb-8 pt-3 px-6 flex flex-col gap-3">
              <button_1.Button type="submit" className="w-full gradient-gold text-primary-foreground font-black tracking-widest uppercase rounded-lg h-11 hover:brightness-110 hover:shadow-[0_0_15px_rgba(218,165,32,0.35)] transition-all duration-300 active:scale-[0.98]" disabled={loading}>
                {loading ? "Decrypting..." : "Connect Production Deck"}
              </button_1.Button>

              {/* Supabase Google OAuth (Gmail) Verification Button */}
              <div className="relative w-full flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"/></div>
                <span className="relative z-10 px-3 bg-[#0c0c14]/90 text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Verification Provider</span>
              </div>

              <button_1.Button type="button" onClick={handleGoogleLogin} className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg h-11 font-black text-xs uppercase tracking-widest hover:bg-zinc-800 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                {/* Colored Google G logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.427-3.3c-2.2-2.05-5.047-3.3-8.474-3.3C4.856 0 0 4.856 0 10.8s4.856 10.8 10.8 10.8c5.688 0 9.475-3.99 9.475-9.643 0-.65-.074-1.14-.162-1.672h-7.873z"/>
                </svg>
                Sign In with Google (Gmail)
              </button_1.Button>
            </card_1.CardFooter>
          </form>)}

        {/* 2. CASTER DESK VIEW */}
        {selectedRole === "caster" && (<form onSubmit={handleLogin}>
            <card_1.CardContent className="space-y-4 px-6 py-4">
              <div className="p-4 rounded-xl bg-gold/5 border border-gold/15 text-center space-y-2">
                <p className="text-xs font-bold text-gold uppercase tracking-wider">Caster Desk Access</p>
                <p className="text-[11px] text-muted-foreground">
                  Login using your secure caster credentials, or verify instantly with Google.
                </p>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Caster Email</label_1.Label>
                <input_1.Input id="email" type="email" placeholder="caster@esports.com" value={email} onChange={function (e) { return setEmail(e.target.value); }} required className="bg-black/50 border-white/10 text-white rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/30 focus:shadow-[0_0_12px_rgba(218,165,32,0.15)] transition-all duration-300 text-sm h-11"/>
              </div>
               
              <div className="space-y-2">
                <label_1.Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Passphrase</label_1.Label>
                <input_1.Input id="password" type="password" placeholder="••••••••" value={password} onChange={function (e) { return setPassword(e.target.value); }} required className="bg-black/50 border-white/10 text-white rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/30 focus:shadow-[0_0_12px_rgba(218,165,32,0.15)] transition-all duration-300 text-sm h-11"/>
              </div>
            </card_1.CardContent>

            <card_1.CardFooter className="pb-8 pt-2 px-6 flex flex-col gap-3">
              <button_1.Button type="submit" className="w-full gradient-gold text-primary-foreground font-black tracking-widest uppercase rounded-lg h-11 hover:brightness-110 hover:shadow-[0_0_15px_rgba(218,165,32,0.35)] transition-all duration-300 active:scale-[0.98]" disabled={loading}>
                {loading ? "Connecting..." : "Enter Caster Desk"}
              </button_1.Button>

              <div className="relative w-full flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"/></div>
                <span className="relative z-10 px-3 bg-[#0c0c14]/90 text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Realtime SSO</span>
              </div>

              <button_1.Button type="button" onClick={handleGoogleLogin} className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg h-11 font-black text-xs uppercase tracking-widest hover:bg-zinc-800 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.427-3.3c-2.2-2.05-5.047-3.3-8.474-3.3C4.856 0 0 4.856 0 10.8s4.856 10.8 10.8 10.8c5.688 0 9.475-3.99 9.475-9.643 0-.65-.074-1.14-.162-1.672h-7.873z"/>
                </svg>
                Verify via Gmail (Google)
              </button_1.Button>
            </card_1.CardFooter>
          </form>)}

      </card_1.Card>
      
    </div>);
}
