# PMGC 2024-2025 Point System Update

## Official PUBG Mobile Global Championship Scoring

This document outlines the latest PMGC (PUBG Mobile Global Championship) 2024-2025 point system implemented throughout the live production system.

---

## Placement Points (Official PMGC Scoring)

| Placement | Points | Notes |
|-----------|--------|-------|
| 1st       | 10 pts | Winner Winner Chicken Dinner (WWCD) |
| 2nd       | 6 pts | Runner-up |
| 3rd       | 5 pts | Third place |
| 4th       | 4 pts  | Fourth place |
| 5th       | 3 pts  | Fifth place |
| 6th       | 2 pts  | Sixth place |
| 7th       | 1 pts  | Seventh place |
| 8th       | 1 pt   | Eighth place |
| 9th       | 0 pt   | Ninth place |
| 10th      | 0 pt   | Tenth place |
| 11th+     | 0 pts  | No points for 11th and below |

**Kill Points:** 1 point per kill (applies to all placements)

**Total Match Points = Placement Points + (Number of Kills × 1)**

---

## Key System Updates

### 1. Type System (`lib/types.ts`)
- Updated `DEFAULT_POINT_SYSTEM` with PMGC 2024-2025 scoring
- Extended placement support from 16 to 30 teams
- Added `PMGC_SCORING_INFO` constant with detailed information
- Placement points now align with official PUBG Mobile Global Championship rules

### 2. Analytics Engine (`lib/analytics.ts`)
- Renamed `getPlacementPoints()` to `getPMGCPlacementPoints()`
- Updated all point calculations to use official PMGC scoring
- Match reports now use PMGC placement formula
- Tournament reports calculate standings based on PMGC rules

### 3. Admin Dashboard (`app/admin/tournament/page.tsx`)
- Updated Point System card UI to display full PMGC 2024-2025 scoring table
- Visual distinction for 1st place (WWCD) with gold border
- Clear display of all 10 point-awarding positions
- Added PMGC version reference in card header

### 4. Data Store (`lib/store.ts`)
- Point system calculations already aligned with PMGC format
- Standings sorting: Total Points → Total Kills → WWCD count
- Match results properly calculate placement vs kill points

---

## Features Preserved

✅ Real-time kill tracking (1 point per kill)
✅ Team wipe detection and display
✅ Kill streak announcements (Double/Triple/Quad/Rampage)
✅ MVP selection based on kills and WWCD
✅ Team rankings and leaderboards
✅ Match history and tournament standings
✅ Analytics and reporting with CSV/JSON export
✅ All animation effects and overlays

---

## Broadcasting Features Using PMGC System

### Live Overlays
- **Rankings Panel** - Auto-updated standings with PMGC points
- **Kill Feed** - Real-time kills showing point value (1 pt each)
- **WWCD Banner** - Celebration when team wins match (15 pts)
- **Top Fraggers** - Highest individual kill counts
- **Team Status** - Player alive/knocked/eliminated indicators

### Admin Controls
- **Tournament Setup** - Configure PMGC-based point system
- **Live Match Controller** - Record placements and kills
- **Effects Panel** - Trigger animations and special events
- **Analytics Dashboard** - View statistics using PMGC scoring
- **Match Reports** - Generate detailed reports with PMGC calculations

---

## Example Scoring Scenario

### Match Result: Team Nova finishes 2nd with 6 kills

```
Placement Points: 12 (for 2nd place)
Kill Points: 6 (6 kills × 1 point)
Total Match Points: 18 pts

Breakdown shown in standings:
- Placement Points: 12 pts
- Kill Points: 6 pts
- Total: 18 pts
```

---

## Tournament Structure

### Rounds & Games (Default Configuration)
- **Total Rounds:** 3 rounds
- **Games per Round:** 6 games
- **Total Games:** 18 matches per tournament

Each team's tournament score is the **sum of all match points** across all games.

---

## Qualification System Integration

The PMGC point system supports:
- **Regional Qualifiers** - Teams earn points over multiple matches
- **Global Series** - Points accumulate for top 8 seeds
- **Direct Seeds** - Top teams from each region
- **Wild Card Slots** - Additional qualification paths

---

## Configuration Notes

- System uses localStorage for state persistence (browser-based)
- Real-time sync via BroadcastChannel API for multi-tab overlay synchronization
- All calculations done client-side (instant updates)
- Compatible with OBS browser sources for live streaming

---

## Data Export Features

### CSV Export
Includes: Rank, Team Name, Short Name, Total Points, Kills, Placement Points, WWCD, Matches Played

### JSON Export
Complete tournament standings with full match history and player rosters

### Social Media Export
Pre-formatted text summaries for Twitter, Discord, and streaming platforms

---

## Future Enhancements

Planned additions:
- Regional point multipliers
- Tournament tier system (Qualifier → Main Event)
- Head-to-head tiebreaker support
- Season-long ranking tracking
- Integration with official PMGC API (when available)

---

## Support & Documentation

For issues or questions about the PMGC point system:
1. Check overlays sync via OBS browser sources
2. Verify team roster configuration
3. Review match standings calculation
4. Export and validate data in CSV format

**Version:** PMGC 2024-2025
**Last Updated:** February 2026
