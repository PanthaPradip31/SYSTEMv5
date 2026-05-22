# 🏆 PUBG Mobile Live Production System — Scrum Backlog
## Jira-Ready | 3 Sprints | 12 Working Days | Deadline: 23 May 2026

---

## 📋 Project Overview

| Field | Value |
| :--- | :--- |
| **Project** | PUBG Mobile Live Production System |
| **Total Sprints** | 3 |
| **Sprint Duration** | 4 working days each |
| **Start Date** | Mon, 12 May 2026 |
| **End Date** | Fri, 23 May 2026 |
| **Team Size** | 1 (Solo Full-Stack Developer) |
| **Methodology** | Scrum (Solo Kanban-Scrum Hybrid) |
| **Story Point Scale** | Fibonacci (1, 2, 3, 5, 8) |

---

## 🗂️ Epic Overview

| Epic ID | Epic Name | Priority |
| :--- | :--- | :--- |
| **EP-01** | Database & Backend Integration | 🔴 Critical |
| **EP-02** | Authentication & Security | 🔴 Critical |
| **EP-03** | Admin Dashboard & Director Deck | 🟠 High |
| **EP-04** | Broadcast Overlays & OBS Sources | 🟠 High |
| **EP-05** | Animations & UI/UX Polish | 🟡 Medium |
| **EP-06** | Role-Based Access Control | 🟡 Medium |
| **EP-07** | Production Hardening & Deployment | 🟢 Normal |

---

---

# 🏃 SPRINT 1 — Foundation & Backend
**Dates:** Mon 12 May → Thu 15 May 2026 (4 Days)
**Goal:** Establish Supabase database, admin login, and core overlay routing.

---

## 📌 Sprint 1 — User Stories

---

### PUBG-001 · Initialize Supabase Relational Schema
**Epic:** EP-01 · Database & Backend Integration
**Type:** 🛠️ Task
**Story Points:** 5
**Priority:** 🔴 Critical
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **system administrator**, I want all core database tables initialized in Supabase so that tournament data, player vitals, and standings can be persisted in real-time.

**Acceptance Criteria:**
- [ ] `tournament`, `teams`, `players`, `standings`, `kill_feed`, `overlay_config`, `sponsors` tables created
- [ ] Foreign key cascade deletes configured on `players → teams`
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Public read/write policies applied for client-side access
- [ ] All tables added to `supabase_realtime` publication

**Sub-Tasks:**
- `PUBG-001a` Write SQL schema file (`supabase_schema.sql`) — **2 SP**
- `PUBG-001b` Execute schema in Supabase SQL Editor — **1 SP**
- `PUBG-001c` Enable Real-time publication for all 7 tables — **1 SP**
- `PUBG-001d` Verify WebSocket subscriptions fire on test mutation — **1 SP**

---

### PUBG-002 · Configure Supabase Client & Environment Keys
**Epic:** EP-01 · Database & Backend Integration
**Type:** 🛠️ Task
**Story Points:** 2
**Priority:** 🔴 Critical
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **developer**, I want the Supabase client configured with environment variables so that all database calls are secure and deployable.

**Acceptance Criteria:**
- [ ] `.env.local` created with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] `utils/supabase/client.ts` initializes correctly
- [ ] No hardcoded credentials in source files

---

### PUBG-003 · Admin Login Page — Email/Password Auth
**Epic:** EP-02 · Authentication & Security
**Type:** 🧩 Feature
**Story Points:** 5
**Priority:** 🔴 Critical
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **tournament director**, I want to log in with email and password so that I can access the secure admin dashboard.

**Acceptance Criteria:**
- [ ] `/admin/login` route exists and renders correctly
- [ ] `supabase.auth.signInWithPassword()` called on form submit
- [ ] Toast notifications on success and error
- [ ] Redirect to `/admin` on successful session
- [ ] No login without valid Supabase session

---

### PUBG-004 · Admin Route Auth Guard Layout
**Epic:** EP-02 · Authentication & Security
**Type:** 🧩 Feature
**Story Points:** 3
**Priority:** 🔴 Critical
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **system**, I want all `/admin/*` routes protected behind a session guard so that unauthorized users cannot view the admin dashboard.

**Acceptance Criteria:**
- [ ] `app/admin/layout.tsx` checks active Supabase session on mount
- [ ] Unauthenticated users redirected to `/admin/login`
- [ ] `/admin/login` itself is exempt from the session check (no infinite redirect loop)
- [ ] Loading splash screen rendered during session validation
- [ ] Authorized flag initialized as `false` to prevent content flash

---

### PUBG-005 · Real-Time Zustand State Store Setup
**Epic:** EP-01 · Database & Backend Integration
**Type:** 🛠️ Task
**Story Points:** 3
**Priority:** 🟠 High
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **developer**, I want a Zustand state store syncing with Supabase real-time so that all UI components reflect live database changes instantly.

**Acceptance Criteria:**
- [ ] `lib/store.ts` implements `useTeams`, `useStandings`, `useKillFeed` hooks
- [ ] Supabase WebSocket channels subscribed in `lib/realtime.ts`
- [ ] State updates propagate to all connected overlay windows without page refresh

---

### PUBG-006 · Base Overlay Routing — `/overlay/*` Pages
**Epic:** EP-04 · Broadcast Overlays & OBS Sources
**Type:** 🧩 Feature
**Story Points:** 3
**Priority:** 🟠 High
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As an **OBS operator**, I want overlay URLs to exist as separate full-screen pages so that I can add them as browser sources in OBS Studio.

**Acceptance Criteria:**
- [ ] Routes exist: `/overlay/full`, `/overlay/killfeed`, `/overlay/rankings`, `/overlay/results`, `/overlay/teams`, `/overlay/ultimate`, `/overlay/intro`, `/overlay/starting`
- [ ] All overlay pages render with transparent backgrounds (no white flash)
- [ ] Pages are statically optimized at build time

---

**Sprint 1 Velocity: 21 Story Points**

---

---

# 🏃 SPRINT 2 — Director Deck & Core Features
**Dates:** Fri 16 May → Tue 20 May 2026 (4 Days)
**Goal:** Build the full Director control dashboard, role switcher, stinger FX system, and team management.

---

## 📌 Sprint 2 — User Stories

---

### PUBG-007 · Admin Dashboard — Director Deck Layout
**Epic:** EP-03 · Admin Dashboard & Director Deck
**Type:** 🧩 Feature
**Story Points:** 8
**Priority:** 🔴 Critical
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **broadcast director**, I want a premium-looking operations dashboard so that I can control the entire live show from one screen.

**Acceptance Criteria:**
- [ ] Glassmorphic metric gauges: Deployed Teams, Alive, Knocked, Kills
- [ ] Director Control Center Channels routing buttons (Live Match HUD, Tactical Rosters, Monitor Overlays) all white text, highly legible
- [ ] Stagger-fade entrance animations on cards (stagger-1, stagger-2, stagger-3)
- [ ] Ambient radial gold spotlight background
- [ ] OBS source monitor preview panel
- [ ] Realtime combat kill feed table

---

### PUBG-008 · Role Switcher — Director / Observer / Caster-Locked
**Epic:** EP-06 · Role-Based Access Control
**Type:** 🧩 Feature
**Story Points:** 5
**Priority:** 🟠 High
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **user**, I want my role (Admin/Caster) to be remembered after login so that I land on the correct deck automatically.

**Acceptance Criteria:**
- [ ] Login page stores `pubg_admin_role` in `localStorage` before redirect
- [ ] Admin login → stored as `"director"`
- [ ] Caster login → stored as `"caster-locked"`
- [ ] Dashboard reads role from localStorage on mount
- [ ] `caster-locked` users see "Read-Only Locked" badge instead of role switcher
- [ ] Casters cannot call `handleRoleChange()` — hard blocked in code
- [ ] No "Switch to Director" banner shown for locked casters

---

### PUBG-009 · Multi-Role Login Portal — Admin + Caster + User Tabs
**Epic:** EP-02 · Authentication & Security
**Type:** 🧩 Feature
**Story Points:** 5
**Priority:** 🟠 High
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **user**, I want three distinct login role tabs on the login page so that I can enter the correct credentials for my role.

**Acceptance Criteria:**
- [ ] Three capsule tabs: Admin, Caster, User
- [ ] Admin tab: email/password + Cloudflare Turnstile CAPTCHA
- [ ] Caster tab: email/password + Google OAuth button
- [ ] User tab: animated "Building..." construction screen with progress bar
- [ ] Active tab highlighted with gold gradient

---

### PUBG-010 · Cloudflare Turnstile CAPTCHA (Admin Login)
**Epic:** EP-02 · Authentication & Security
**Type:** 🧩 Feature
**Story Points:** 3
**Priority:** 🟠 High
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **system**, I want bot-detection CAPTCHA on Admin login so that automated credential-stuffing attacks are blocked.

**Acceptance Criteria:**
- [ ] Cloudflare Turnstile loaded via explicit JS render API
- [ ] Real-time status indicator: idle / verifying / verified / expired / error
- [ ] Admin form submission blocked if `verificationState !== "verified"`
- [ ] Dark mode Turnstile theme matching esports UI
- [ ] Staging sitekey `1x00000000000000000000AA` used for local testing

---

### PUBG-011 · Google OAuth (Gmail) SSO Integration
**Epic:** EP-02 · Authentication & Security
**Type:** 🧩 Feature
**Story Points:** 3
**Priority:** 🟡 Medium
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **caster or admin**, I want to log in with my Google/Gmail account so that I don't need to remember a separate password.

**Acceptance Criteria:**
- [ ] `supabase.auth.signInWithOAuth({ provider: 'google' })` configured
- [ ] `redirectTo` points to `/admin` after OAuth callback
- [ ] Role stored in localStorage before OAuth redirect initiates
- [ ] Google Client ID configured in Supabase Dashboard

---

### PUBG-012 · Team Management Panel (`/admin/teams`)
**Epic:** EP-03 · Admin Dashboard & Director Deck
**Type:** 🧩 Feature
**Story Points:** 5
**Priority:** 🟠 High
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **director**, I want to add, edit, and delete teams with full player rosters so that the tournament database is populated before match day.

**Acceptance Criteria:**
- [ ] Add team with: name, short tag, brand color, logo URL
- [ ] Add up to 4 player slots per team with IGN names
- [ ] Delete team cascades to player rows (FK constraint)
- [ ] "Load Sample Teams" button populates mock data in 1 click
- [ ] Changes persist to Supabase `teams` and `players` tables instantly

---

### PUBG-013 · Stinger FX Trigger Deck
**Epic:** EP-03 · Admin Dashboard & Director Deck
**Type:** 🧩 Feature
**Story Points:** 5
**Priority:** 🟠 High
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **director**, I want to trigger cinematic stinger animations on the broadcast overlays so that key moments (MVP, WWCD, Epic Wipe) are highlighted for viewers.

**Acceptance Criteria:**
- [ ] 🏆 Trigger MVP: golden rain particle effect
- [ ] 🍗 Trigger WWCD: full-screen winner celebration banner
- [ ] 💀 Trigger Epic Wipe: crimson elimination cinematic
- [ ] Buttons styled as physical console paddles with glowing borders
- [ ] Broadcast via Supabase real-time channel to all overlay subscribers

---

**Sprint 2 Velocity: 34 Story Points**

---

---

# 🏃 SPRINT 3 — Polish, Security & Deployment
**Dates:** Wed 21 May → Fri 23 May 2026 (3 Days)
**Goal:** Full UI polish, security hardening, single-admin enforcement, bug fixes, and production build verification.

---

## 📌 Sprint 3 — User Stories

---

### PUBG-014 · Single-Admin Database Trigger (Postgres)
**Epic:** EP-02 · Authentication & Security
**Type:** 🛡️ Security
**Story Points:** 3
**Priority:** 🔴 Critical
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **system owner**, I want the database to enforce exactly one admin account so that unauthorized users cannot self-register via Supabase auth APIs.

**Acceptance Criteria:**
- [ ] `limit_admin_count()` PL/pgSQL function created
- [ ] `limit_admin_signup` trigger bound `BEFORE INSERT ON auth.users`
- [ ] Exception raised if `count(auth.users) >= 1`
- [ ] Trigger uses `SECURITY DEFINER` for elevated schema access
- [ ] Trigger uses `DROP TRIGGER IF EXISTS` for idempotent re-execution

---

### PUBG-015 · User Panel — Animated "Building..." Splash Screen
**Epic:** EP-05 · Animations & UI/UX Polish
**Type:** 🎨 UI/UX
**Story Points:** 3
**Priority:** 🟡 Medium
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **user** selecting the User tab, I want to see an animated "Under Construction" screen so that I know the panel is coming soon.

**Acceptance Criteria:**
- [ ] SVG crane and scaffolding illustration renders correctly
- [ ] Crane arm swings with `crane-swing` CSS keyframe
- [ ] Scaffolding bobs with `scaff-bob` keyframe
- [ ] Red warning light blinks on top of crane (`blink-hard`)
- [ ] Animated bouncing gold dot ellipsis after "Building" text
- [ ] Gold gradient animated progress bar fills to 82%
- [ ] Feature preview tags: Live Standings, Squad Viewer, Kill Feed, Match Stats
- [ ] "Return to Public Lobby" button navigates to `/`

---

### PUBG-016 · Fix React Key Collision Warning
**Epic:** EP-03 · Admin Dashboard & Director Deck
**Type:** 🐛 Bug Fix
**Story Points:** 1
**Priority:** 🟠 High
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **developer**, I want React key props to be globally unique in all list renders so that the console is free of duplicate-key warnings.

**Acceptance Criteria:**
- [ ] `key={p.id}` in players table changed to `key={\`${team.id}-${p.id}-${idx}\`}`
- [ ] Zero "same key" console warnings in dev and production builds

---

### PUBG-017 · Fix `cn` ReferenceError in Dashboard
**Epic:** EP-03 · Admin Dashboard & Director Deck
**Type:** 🐛 Bug Fix
**Story Points:** 1
**Priority:** 🔴 Critical
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **user**, I want the admin dashboard to load without runtime errors so that I can use the Director controls immediately after login.

**Acceptance Criteria:**
- [ ] `import { cn } from "@/lib/utils"` added to `app/admin/page.tsx`
- [ ] No ReferenceError thrown at line 317 or any other line
- [ ] `npm run build` exits with code 0

---

### PUBG-018 · Director Control Center Channels — White Text Contrast
**Epic:** EP-05 · Animations & UI/UX Polish
**Type:** 🎨 UI/UX
**Story Points:** 1
**Priority:** 🟠 High
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **director**, I want all text inside the Director Control Center Channels card to be white so that route buttons are fully legible on dark screens.

**Acceptance Criteria:**
- [ ] CardTitle: `text-white font-black`
- [ ] CardDescription: `text-white/80 font-bold`
- [ ] All three buttons: `text-white hover:text-white` explicit

---

### PUBG-019 · UI/UX Design System Documentation
**Epic:** EP-05 · Animations & UI/UX Polish
**Type:** 📄 Documentation
**Story Points:** 2
**Priority:** 🟡 Medium
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **developer or designer**, I want a documented design system so that all components follow a consistent visual language.

**Acceptance Criteria:**
- [ ] `ui_ux_design.md` created in project root
- [ ] Color token table documented (7 palette tokens)
- [ ] Typography hierarchy defined
- [ ] Glassmorphism CSS formulas documented
- [ ] Stagger-fade keyframe code examples included
- [ ] OBS Canvas accessibility rules listed

---

### PUBG-020 · Start-to-Live Master Guide Documentation
**Epic:** EP-07 · Production Hardening & Deployment
**Type:** 📄 Documentation
**Story Points:** 2
**Priority:** 🟡 Medium
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **new team member or director**, I want a complete guide from database setup to live broadcast so that I can run the system independently.

**Acceptance Criteria:**
- [ ] `guide.md` created in project root
- [ ] Covers: Supabase setup, local install, team management, live match operations, OBS config, caster sync, Vercel deployment
- [ ] Single-admin database trigger documented with reset instructions
- [ ] OBS browser source dimensions and settings documented

---

### PUBG-021 · Production Build Verification (npm run build)
**Epic:** EP-07 · Production Hardening & Deployment
**Type:** 🛠️ Task
**Story Points:** 2
**Priority:** 🔴 Critical
**Assignee:** Developer
**Status:** ✅ Done

**User Story:**
> As a **developer**, I want the Next.js production build to complete without errors so that the app is deployable to Vercel.

**Acceptance Criteria:**
- [ ] `npm run build` exits with **code 0**
- [ ] All 26 static pages pre-rendered successfully
- [ ] Zero TypeScript errors
- [ ] Zero console warnings in dev mode
- [ ] All overlay routes listed in build output

---

### PUBG-022 · Vercel Deployment Configuration
**Epic:** EP-07 · Production Hardening & Deployment
**Type:** 🛠️ Task
**Story Points:** 2
**Priority:** 🟡 Medium
**Assignee:** Developer
**Status:** 🔲 Backlog

**User Story:**
> As a **production team**, I want the app deployed on Vercel so that directors and casters can access it from anywhere during the tournament.

**Acceptance Criteria:**
- [ ] GitHub repository initialized and pushed
- [ ] Vercel project linked to GitHub repo
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set in Vercel environment variables
- [ ] Production domain configured and live
- [ ] OBS sources updated to use production URL

---

**Sprint 3 Velocity: 17 Story Points**

---

---

## 📊 Sprint Summary Board

| Sprint | Days | Stories | Story Points | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** (12–15 May) | 4 | PUBG-001 → PUBG-006 | **21 SP** | ✅ Complete |
| **Sprint 2** (16–20 May) | 4 | PUBG-007 → PUBG-013 | **34 SP** | ✅ Complete |
| **Sprint 3** (21–23 May) | 3 | PUBG-014 → PUBG-022 | **17 SP** | ✅ Complete |
| **TOTAL** | **11 days** | **22 stories** | **72 SP** | ✅ **Delivered** |

---

## 📁 Jira Labels Reference

| Label | Description |
| :--- | :--- |
| `feature` | New user-facing functionality |
| `bug` | Defect fix |
| `security` | Auth, access control, CAPTCHA |
| `database` | Supabase schema, triggers, RLS |
| `ui-ux` | Visual polish, animations |
| `animation` | CSS keyframes, entrance effects |
| `documentation` | Guides, specs |
| `devops` | Build, deployment, CI |
| `overlay` | OBS broadcast graphics |
| `role-based-access` | Director/Caster/User permissions |

---

## 🐛 Bug Log

| Bug ID | Description | Sprint | Resolution |
| :--- | :--- | :--- | :--- |
| **BUG-001** | `cn is not defined` ReferenceError at `/admin` line 317 | S3 | Added `import { cn } from "@/lib/utils"` — ✅ Fixed |
| **BUG-002** | Duplicate React key `p-team-24-sub-1` in player table map | S3 | Changed key to composite `${team.id}-${p.id}-${idx}` — ✅ Fixed |
| **BUG-003** | Google OAuth did not persist role before redirect | S2 | Added `localStorage.setItem` before `signInWithOAuth()` — ✅ Fixed |
| **BUG-004** | Director Control Center text invisible on dark background | S3 | Applied `text-white` and `text-white/80` explicitly — ✅ Fixed |
| **BUG-005** | Caster could manually switch to Director Desk via UI toggle | S3 | Role-locked `caster-locked` state with hard block in `handleRoleChange` — ✅ Fixed |

---

## 🚀 Definition of Done (DoD)

A story is considered **Done** when:

- [ ] Feature is implemented and working in development server
- [ ] No TypeScript compiler errors
- [ ] No console errors or warnings in browser DevTools
- [ ] `npm run build` exits with **code 0**
- [ ] Supabase real-time sync verified on affected tables
- [ ] Responsive layout verified at 1920×1080 (OBS) and desktop breakpoints
- [ ] Code committed to version control

---

*Generated: 2026-05-18 | PUBG Mobile Live Production System | Solo Scrum Sprint Board*
