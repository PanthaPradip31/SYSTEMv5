# 🏆 PUBG Mobile Live Production System: Definitive Master Guide

Welcome to the **PUBG Mobile Live Production System**! This guidebook walks you through the entire workflow—from initializing your database, configuring local servers, registering team rosters, utilizing administrative controllers, setting up OBS Studio browser sources, syncing remote casters, and deploying live to the web.

---

## 📋 Table of Contents

1. [System Overview &amp; Architecture](#-system-overview--architecture)
2. [Step 1: Backend Database Setup (Supabase)](#step-1-backend-database-setup-supabase)
3. [Step 2: Local Installation &amp; Environment Keys](#step-2-local-installation--environment-keys)
4. [Step 3: Managing Teams &amp; Tournament Roster Setup](#step-3-managing-teams--tournament-roster-setup)
5. [Step 4: Operating Live Matches &amp; Triggering VFX Stingers](#step-4-operating-live-matches--triggering-vfx-stingers)
6. [Step 5: OBS Studio Broadcast Configurations](#step-5-obs-studio-broadcast-configurations)
7. [Step 6: Remote Caster Synchronization Blueprint](#step-6-remote-caster-synchronization-blueprint)
8. [Step 7: Live Cloud Deployment (Vercel)](#step-7-live-cloud-deployment-vercel)

---

## 🌐 System Overview & Architecture

This application consists of two core spaces:

1. **Secure Admin & Director Panels (`/admin`)**: Protected behind a client-side JWT route guard. Used to configure rosters, trigger stinger effects, register kills/knocks, upload commentator socials, and override database vitals.
2. **Broadcast Overlays (`/overlay`)**: Full-screen and HUD widgets (starting soon, overall standings, live rankings, kill feeds, WWCD banners) loaded into OBS Studio as browser sources.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              NEXT.JS APP                               │
├───────────────────────────────────┬────────────────────────────────────┤
│   ADMIN PANELS (Director Console)  │   OBS STUDIO OVERLAYS (Graphics)   │
│   • Match Control Panel           │   • Countdown / Intros             │
│   • Roster Management             │   • Leaderboards & STANDINGS       │
│   • Caster social profile setup   │   • Transparent Combat HUD Widgets │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  └─────────► REAL-TIME SYNC ◄─────────┘
                       (Supabase WebSockets Realtime)
```

---

## Step 1: Backend Database Setup (Supabase)

The system relies on Supabase for data persistence and instant WebSocket-driven real-time updates.

### 1. Initialize Tables in the SQL Editor

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Navigate to the **SQL Editor** tab on the left-hand sidebar.
3. Open the [supabase_schema.sql](file:///d:/SySteM/pubg-live-production/supabase_schema.sql) file located in your workspace root, copy its entire contents, paste them into the SQL editor, and click **Run**.
4. This creates the tables: `tournament`, `teams`, `players`, `standings`, `kill_feed`, `overlay_config`, and `sponsors`.

### 2. Enable Real-Time Replication

To trigger instant UI renders on your OBS overlays as soon as you record a kill in the Admin panel, WebSocket Real-time must be turned on:

1. In the Supabase Dashboard, go to **Database > Replication**.
2. Under **Publications**, edit the default `supabase_realtime` publication.
3. Enable the toggle switches for the following tables:
   * `public.teams`
   * `public.players`
   * `public.standings`
   * `public.kill_feed`
   * `public.overlay_config`
   * `public.sponsors`
     *(Alternatively, these are enabled automatically by the SQL commands at the end of `supabase_schema.sql`!)*

### 3. Create Your Admin Login Credentials

Supabase isolates administration accounts inside its secure internal `auth.users` schema.

> [!IMPORTANT]
> **Strict Single-Admin Guard Active:** 
> We have bound a secure Postgres trigger (`limit_admin_signup`) to your Supabase `auth.users` schema. It actively blocks registrations if there is already 1 user in the database, preventing unauthorized signups or bots from registering additional accounts. 

To create your single admin user:
1. In the Supabase Dashboard, click on **Authentication > Users**.
2. Click **"Add User"** and select **"Create User"**.
3. Enter an email (e.g., `director@esports.com`) and a secure password.
4. *Crucial:* **Uncheck** "Send invite email" to make the account active immediately, and click **Save**.

> [!TIP]
> **To change/reset your Admin Account:** If you need to register a different administrator address, you must **first delete** the existing user inside the **Authentication > Users** list. Once deleted, the trigger immediately releases the limit, allowing you to create the new singular admin account!

---

## Step 2: Local Installation & Environment Keys

### 1. Configure Environmental Variables

Create a file named `.env.local` in the project root and add your Supabase credentials:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

> NOTE: Do not commit `.env.local` to source control. This repository already ignores `.env*`.


### 2. Install and Run Local Server

Open your terminal inside the project directory:

```powershell
# Install all required npm packages
npm install

# Run the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser. You will see the lobby index screen!

---

## Step 3: Managing Teams & Tournament Roster Setup

Before jumping into a match, you need to populate the database with combatant rosters and scrim configurations.

### 1. Access Secure Admin Dashboard

1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin).
2. The secure guard catches the guest request, displaying the themed splash screen loader and transferring you to the **Admin Login** page (`/admin/login`).
3. Enter the email and password you created in your Supabase Auth dashboard in Step 1.

### 2. Configure Esports Teams & Combatants

1. Go to **Admin > Teams** on the sidebar.
2. Click **"Load Sample Teams"** to populate the system with professional mock teams (Nova, Soul, GodL, Bigetron) to check your setup in 1 click, or click **"Add Team"** to register them manually.
3. For each team, set:
   * Full Name (e.g., `Nova Esports`) and Short Tag (e.g., `NOVA`).
   * Dynamic brand color code (e.g., `#7A2A8F` for purple).
   * Add 4 players' in-game names (IGN) to slots.
   * Add team logo image.

### 3. Set Tournament Details & Standings

1. Navigate to **Admin > Tournament**.
2. Define Scrim details (Tournament Name, Map name, Scrim Title).
3. Ensure the point formula is set to **PMGC Standard 2024-2025** (10 pts for 1st place, 1 pt per kill).
4. Click **"Initialize Standings"**. This automatically matches all configured teams to zero-point standing trackers.

---

## Step 4: Operating Live Matches & Triggering VFX Stingers

During a live broadcast, the Director controls the action from the dashboard:

```
┌─────────────────────────────────────────────────────────────┐
│  LIVE DIRECTING WORKFLOW (Lobby & Match Combat Controls)    │
├─────────────────────────────────────────────────────────────┤
│  1. Match Setup:      Select Map & Click [Start Match]       │
│                                                             │
│  2. Combat Entries:   Select MODE (○ Knock / ○ Kill)         │
│                       Click Killer Squad ──► Click Victim   │
│                                                             │
│  3. Cinematic Stingers: Select Effect ──► Trigger Trigger   │
│                       [Trigger MVP]  [WWCD Banner]          │
│                                                             │
│  4. Match End:        Click [End Match] to calculate scores  │
└─────────────────────────────────────────────────────────────┘
```

### 1. Start Scrim Map

1. Go to **Admin > Live Match**.
2. Set active Map (Erangel / Miramar / Sanhok).
3. Click **"Start Match"** to active global listeners.

### 2. Enter Knocks, Kills, and wipes

* **Knocking a Player:** Select `Knock` mode, click the attacker team, then click the victim team.
* **Eliminating a Player (Kill):** Select `Kill` mode, click the killer team, then click the victim team.
* **Recording Wipes:** When the 4th player of a squad is eliminated, the system displays a team wipe banner in OBS automatically!

### 3. Trigger Director Stingers

Under **Admin > Effects Deck**, trigger overlays on stream at key moments:

* **Trigger MVP Screen:** Highlights the match's top performer with custom cinematic golden rain and smoke particle VFX.
* **Chicken Dinner (WWCD):** Triggers a full-screen, high-end celebratory WWCD banner colored in the winner's branding!

### 4. Conclude Match

1. Once the map finishes, click **"End Match"**.
2. The tournament standings database table is automatically calculated and updated on Supabase.
3. Reset the active lobby cards using the Director Control panel's **"Reset Match"** button to start the next match!

---

## Step 5: OBS Studio Broadcast Configurations

To feed these graphics onto your YouTube / Twitch live streams, add them to OBS Studio.

### 1. Adding Overlay Browser Sources

For each overlay scene, create a new browser source in OBS:

1. In OBS, go to **Sources > Add Source (+) > Browser**.
2. Set the URL to your local server (or live URL):
   * **Count Countdown (Pre-Match):** `http://localhost:3000/overlay/starting`
   * **Standings Leaderboard:** `http://localhost:3000/overlay/rankings`
   * **End-of-Match Results Standings:** `http://localhost:3000/overlay/results`
   * **Transparent Combat HUD HUDs (Lower Third, Killfeed, Wipe Banners):** `http://localhost:3000/overlay/ultimate`

### 2. Essential OBS Source Settings

To prevent lag, cache problems, or graphic bugs, configure these settings in OBS:

* **Width:** `1920`
* **Height:** `1080`
* **Custom CSS:** *Ensure this field is completely blank!*
* **Enable: "Shutdown source when not visible"** (This saves your CPU usage when switching scenes!).
* **Enable: "Refresh browser when scene becomes active"** (This guarantees that team rosters and standing arrays are updated instantly).

---

## Step 6: Remote Caster Synchronization Blueprint

Esports casters often commentate from home and experience streaming lag (YouTube/Twitch feed lag is usually 3 to 10 seconds). Use these strategies to keep commentary in sync with gameplay:

### 1. Give Casters the Telemetry Deck

Do **not** have your remote casters commentate solely by watching the YouTube stream. Instead:

1. Share the **User Observer Roster Dashboard** link: `http://localhost:3000/admin` (Switch to Caster Mode).
2. This gives commentators a real-time, low-latency display of active team HP metrics, weapon loads, and kill alerts directly via Supabase WebSockets, bypassing streaming lag!

### 2. OBS Voice Sync Offset Setup

If casters are talking over Discord or VDO.ninja while looking at the telemetry deck:

1. Go to **OBS Advanced Audio Properties**.
2. Add a **Sync Offset** (usually `+1500ms` to `+3000ms`) to the casters' audio feed.
3. This delays the commentators' voice slightly so it matches the gameplay visuals on stream perfectly!

---

## Step 7: Live Cloud Deployment (Vercel)

Deploy your live production system to the web using Vercel so your crew can manage overlays from anywhere.

### 1. Upload Code to GitHub

1. Initialize a git repository in the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initialize PUBG Live Production System"
   ```
2. Push it to a new private GitHub repository.

> If you are running this project locally on Windows, keep the workspace on a local disk rather than on a network share or mounted folder. Next.js can detect a slow filesystem and show warnings when `.next/dev` is not on local storage.

### 2. Deploy to Vercel

1. Open the [Netlify Dashboard](https://app.netlify.com) and go to your site settings, or open the [Vercel Dashboard](https://vercel.com) if you prefer.
2. Import your GitHub repository.
3. Configure your production branch in the host provider so only that branch deploys to production.
4. In **Environment Variables** / **Site variables**, add the Supabase credentials from your `.env.local` file:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. If you host on Netlify, add the same keys under **Site settings → Build & deploy → Environment**.
5. If using Google OAuth, add the production callback URL in Supabase:
   * `https://<your-production-domain>/admin`
6. Click **Deploy**. Your site will build with Supabase enabled.

> Production deploys must come from the designated production branch only. Use deploy previews or branch deploys for feature work and non-production testing.


---

*Now you are fully prepared to run a professional-grade PUBG Mobile live broadcast! Good luck!*
