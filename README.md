# PUBG Live Production System

A real-time, automated live production system for PUBG Mobile tournaments that updates overlays dynamically. Built for grassroots tournament organizers who need professional-quality broadcasts without expensive software.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Quick Start Guide](#quick-start-guide)
4. [Admin Dashboard](#admin-dashboard)
5. [OBS Integration](#obs-integration)
6. [Overlay Reference](#overlay-reference)
7. [Workflow Guide](#workflow-guide)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This system replaces manual Excel/Google Sheets updates with an automated solution that:

- Updates rankings and statistics in real-time
- Provides broadcast-ready overlays for OBS Studio
- Syncs data across multiple browser windows instantly
- Calculates points automatically using PMGC scoring system

### Tech Stack

- **Frontend:** Next.js 16 + React 19
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand with localStorage persistence
- **Real-time Sync:** BroadcastChannel API (cross-tab communication)
- **Integration:** OBS Browser Source compatible

---

## Features

| Feature | Description |
|---------|-------------|
| Live Rankings | Auto-updating leaderboard with placement, kills, and total points |
| Kill Feed | Real-time kill notifications with team colors and weapon info |
| Team Status | Player status indicators (alive/knocked/eliminated) |
| Top Fraggers | Current match kill leaders display |
| Team Intro | Animated team introduction for broadcasts |
| Match Results | End-of-match results reveal animation |
| Lower Third | Scrolling ticker for announcements |
| Player Spotlight | Individual player highlight overlay |
| Analytics | Charts, statistics, and exportable reports |

---

## Quick Start Guide

### Step 1: Set Up Teams

1. Navigate to **Admin > Teams** (`/admin/teams`)
2. Click **"Load Sample Teams"** to add demo teams, OR
3. Click **"Add Team"** to create teams manually:
   - Enter team name and tag (e.g., "Soul" / "SOUL")
   - Add 4 players per team
   - Optionally add team logo URL

### Step 2: Initialize Tournament

1. Go to **Admin > Tournament** (`/admin/tournament`)
2. Configure tournament settings:
   - Tournament name
   - Format (Solo/Duo/Squad)
   - Number of matches
   - Point system (PMGC Standard recommended)
3. Click **"Initialize Standings"** to create the leaderboard

### Step 3: Run a Live Match

1. Open **Admin > Live Match** (`/admin/live`)
2. Click **"Start Match"** to begin
3. Record gameplay:
   - **Record Kill:** Click a team (killer), then click victim team
   - **Record Knock:** Same process, registers as knock
   - **Record Elimination:** When a team is fully eliminated
4. Click **"End Match"** when the match concludes
5. Points are calculated automatically

### Step 4: Add Overlays to OBS

1. Go to **Admin > Overlays** (`/admin/overlays`)
2. Copy overlay URLs (e.g., `/overlay/rankings`)
3. In OBS Studio:
   - Add **Browser Source**
   - Paste the overlay URL
   - Set dimensions (1920x1080 recommended)
   - Check **"Shutdown source when not visible"**

---

## Admin Dashboard

Access the admin panel at `/admin`

### Pages

| Page | Path | Purpose |
|------|------|---------|
| Dashboard | `/admin` | Overview and quick actions |
| Teams | `/admin/teams` | Manage teams and players |
| Tournament | `/admin/tournament` | Configure tournament settings |
| Live Match | `/admin/live` | Real-time match control |
| Overlays | `/admin/overlays` | Manage broadcast overlays |
| Analytics | `/admin/analytics` | Statistics and reports |

### Match Controller

The Live Match page (`/admin/live`) is your primary control center during broadcasts:

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│  MATCH CONTROLLER                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Start Match]  [End Match]  [Reset Match]                  │
│                                                             │
│  Recording Mode: ○ Kill  ○ Knock  ○ Elimination             │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  SOUL    │ │  GODL    │ │  NOVA    │ │  BTR     │       │
│  │  4 alive │ │  3 alive │ │  2 alive │ │  0 alive │       │
│  │  5 kills │ │  3 kills │ │  2 kills │ │  1 kill  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│  Kill Feed:                                                 │
│  • SOUL_Goblin killed NOVA_Rusher (M416)                   │
│  • GODL_Mavi knocked BTR_Zuxxy (AWM)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Recording Kills

1. Select recording mode (Kill/Knock/Elimination)
2. Click the **killer's team card** (highlights in yellow)
3. Click the **victim's team card**
4. Kill is recorded and overlays update instantly

---

## OBS Integration

### Adding Browser Sources

For each overlay you want to display:

1. **OBS Studio > Sources > Add > Browser**
2. Configure:
   \`\`\`
   URL: http://localhost:3000/overlay/rankings
   Width: 1920
   Height: 1080
   FPS: 60
   Custom CSS: (leave empty)
   \`\`\`
3. **Important:** Enable "Shutdown source when not visible"

### Recommended Scene Setup

\`\`\`
Scene: PUBG Match
├── Game Capture (PUBG gameplay)
├── Browser: Rankings    (/overlay/rankings)    [Right side]
├── Browser: Kill Feed   (/overlay/killfeed)    [Top right]
├── Browser: Team Status (/overlay/teams)       [Bottom]
└── Browser: Match Info  (/overlay/full)        [Top left]

Scene: Team Intro
├── Background Image
└── Browser: Intro       (/overlay/intro)       [Center]

Scene: Match Results
├── Background Image
└── Browser: Results     (/overlay/results)     [Center]
\`\`\`

### Triggering Overlays from Admin

From the **Overlays** admin page, you can trigger special overlays:

- **Team Intro:** Select team > Click "Show Intro"
- **Player Spotlight:** Select player > Click "Spotlight"
- **Match Results:** Click "Show Results" (after match ends)
- **Lower Third:** Enter message > Click "Show Ticker"

These sync in real-time to OBS browser sources.

---

## Overlay Reference

### Always-On Overlays

| Overlay | URL | Dimensions | Description |
|---------|-----|------------|-------------|
| Full Overlay | `/overlay/full` | 1920x1080 | Complete broadcast layout |
| Rankings | `/overlay/rankings` | 400x800 | Standings leaderboard |
| Kill Feed | `/overlay/killfeed` | 400x600 | Recent kills list |
| Team Status | `/overlay/teams` | 1920x100 | All teams alive status |
| Top Fraggers | `/overlay/fraggers` | 400x300 | Current match top killers |

### Triggered Overlays

| Overlay | URL | Trigger | Duration |
|---------|-----|---------|----------|
| Team Intro | `/overlay/intro` | Admin button | 5 seconds |
| Player Spotlight | `/overlay/spotlight` | Admin button | 5 seconds |
| Match Results | `/overlay/results` | Admin button | Until dismissed |
| Lower Third | `/overlay/lowerthird` | Admin button | 8 seconds |

---

## Workflow Guide

### Pre-Tournament Setup

\`\`\`
1. Create all teams with rosters
2. Configure tournament settings
3. Initialize standings
4. Set up OBS scenes with overlay browser sources
5. Test all overlays are receiving data
\`\`\`

### During Each Match

\`\`\`
1. Start Match (resets current match stats)
2. Record kills/knocks as they happen
3. Record team eliminations for placement
4. Overlays update automatically
5. End Match (finalizes placement points)
\`\`\`

### Between Matches

\`\`\`
1. Standings automatically update
2. Use Team Intro overlay for next match teams
3. Review analytics for commentary stats
4. Reset for next match
\`\`\`

### Post-Tournament

\`\`\`
1. Export final standings (CSV/JSON)
2. Generate social media text
3. Save match history for records
\`\`\`

---

## Point System (PMGC Standard)

### Placement Points

| Place | Points |
|-------|--------|
| 1st (WWCD) | 10 |
| 2nd | 6 |
| 3rd | 5 |
| 4th | 4 |
| 5th | 3 |
| 6th | 2 |
| 7th | 1 |
| 8th | 1 |
| 9th-16th | 0 |

### Kill Points

- **1 kill = 1 point**

### Total Points Formula

\`\`\`
Total = Placement Points + (Kills × 1)
\`\`\`

---

## Keyboard Shortcuts

| Shortcut | Action | Page |
|----------|--------|------|
| `Space` | Start/End Match | Live Match |
| `K` | Set Kill Mode | Live Match |
| `N` | Set Knock Mode | Live Match |
| `E` | Set Elimination Mode | Live Match |
| `Esc` | Cancel Selection | Live Match |
| `R` | Reset Current Match | Live Match |

---

## Data Storage

All data is stored in **localStorage** for simplicity:

\`\`\`javascript
// Storage Keys
pubg-teams        // Team roster data
pubg-tournament   // Tournament configuration
pubg-standings    // Current standings
pubg-match        // Current match state
pubg-killfeed     // Kill feed history
pubg-analytics    // Match history and stats
\`\`\`

### Exporting Data

From the Analytics page:
- **CSV Export:** Spreadsheet-compatible format
- **JSON Export:** Full data backup
- **Social Text:** Ready-to-post tournament summary

### Clearing Data

To reset all data, open browser DevTools:
\`\`\`javascript
localStorage.clear()
location.reload()
\`\`\`

---

## Troubleshooting

### Overlays not updating in OBS

1. Ensure both admin and overlay are on the same origin
2. Refresh the browser source in OBS
3. Check that the match is in "active" state

### Kill feed not showing

1. Verify kill was recorded (check admin panel)
2. Ensure kill feed overlay is loaded (`/overlay/killfeed`)
3. Check browser console for errors

### Team logos not displaying

1. Verify logo URL is accessible (not blocked by CORS)
2. Use direct image URLs (ending in .png, .jpg, etc.)
3. Consider hosting logos locally in `/public/logos/`

### Points not calculating correctly

1. Check placement is recorded when team is eliminated
2. Verify point system is configured in tournament settings
3. Ensure match is ended properly to finalize placements

### Real-time sync not working

1. All tabs must be on the same origin (localhost:3000)
2. BroadcastChannel requires same-origin policy
3. For cross-device sync, implement WebSocket server (future feature)

---

## Deployment

### For Production Use

1. Deploy to Vercel (click Publish in v0)
2. Update overlay URLs in OBS to production domain
3. Share admin URL with production crew

### Environment Variables

No environment variables required for basic functionality.

For future database integration:
\`\`\`env
DATABASE_URL=your_database_url
NEXT_PUBLIC_WS_URL=your_websocket_server
\`\`\`

---

## Future Enhancements

- [ ] WebSocket server for cross-device sync
- [ ] PUBG API integration for automatic data
- [ ] OCR screen capture for kill detection
- [ ] Multiple tournament support
- [ ] User authentication for operators
- [ ] Cloud database persistence

---

## Credits

Built for the grassroots PUBG Mobile esports community.

**Inspired by:** Official PUBG Mobile Esports broadcasts

---

## Support

For issues or feature requests, document them clearly with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/OS information
