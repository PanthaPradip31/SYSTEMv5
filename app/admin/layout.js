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
exports.default = AdminLayout;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var client_1 = require("@/utils/supabase/client");
var sidebar_1 = require("@/components/admin/sidebar");
var icons_1 = require("@/components/icons");
function AdminLayout(_a) {
    var _this = this;
    var children = _a.children;
    var router = (0, navigation_1.useRouter)();
    var pathname = (0, navigation_1.usePathname)();
    var _b = (0, react_1.useState)(false), authorized = _b[0], setAuthorized = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(undefined), role = _d[0], setRole = _d[1];
    (0, react_1.useEffect)(function () {
        if (typeof window !== "undefined") {
            var storedRole = localStorage.getItem("pubg_admin_role");
            if (storedRole === "observer") {
                setRole("caster-locked");
            }
            else if (storedRole === "director" || storedRole === "caster-locked") {
                setRole(storedRole);
            }
            else {
                setRole(null);
            }
        }
    }, []);
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
    (0, react_1.useEffect)(function () {
        // Exempt login page from authorization check to prevent loops
        if (pathname === "/admin/login") {
            setAuthorized(true);
            setLoading(false);
            return;
        }
        if (role === undefined) {
            // Wait until localStorage role is loaded before checking session.
            return;
        }
        function checkSession() {
            return __awaiter(this, void 0, void 0, function () {
                var supabase, session, headers, res, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, 6, 7]);
                            supabase = (0, client_1.default)();
                            return [4 /*yield*/, waitForAuthSession(supabase)];
                        case 1:
                            session = _a.sent();
                            if (!session) {
                                router.replace("/admin/login");
                                return [2 /*return*/];
                            }
                            if (!(role === "director")) return [3 /*break*/, 3];
                            headers = {};
                            if (session.access_token) {
                                headers.Authorization = "Bearer ".concat(session.access_token);
                            }
                            return [4 /*yield*/, fetch('/api/admin/check', {
                                    credentials: 'same-origin',
                                    headers: headers,
                                })];
                        case 2:
                            res = _a.sent();
                            if (res.ok) {
                                setAuthorized(true);
                            }
                            else {
                                if (typeof window !== "undefined") {
                                    localStorage.removeItem("pubg_admin_role");
                                }
                                router.replace('/admin/login');
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            if (role) {
                                setAuthorized(true);
                            }
                            else {
                                router.replace("/admin/login");
                            }
                            _a.label = 4;
                        case 4: return [3 /*break*/, 7];
                        case 5:
                            error_1 = _a.sent();
                            router.replace("/admin/login");
                            return [3 /*break*/, 7];
                        case 6:
                            setLoading(false);
                            return [7 /*endfinally*/];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        }
        checkSession();
    }, [pathname, router, role]);
    if (loading) {
        return (<div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 select-none">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-gold/20 border-t-gold animate-spin"/>
          <icons_1.PlayIcon className="w-6 h-6 text-gold animate-pulse"/>
        </div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest animate-pulse">
          Validating Secure Session...
        </p>
      </div>);
    }
    // Hide intermediate flashes for unauthorized redirection
    if (!authorized)
        return null;
    // Render login screen cleanly without the dashboard sidebar
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }
    return (<div className="min-h-screen flex bg-background">
      <sidebar_1.AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>);
}
