-- PUBG Live Production System Supabase Database Schema Setup
-- Run this in your Supabase SQL Editor to initialize all relational tables.
-- This schema supports multiple authenticated users, with an admin list for privileged actions.

-- 1. Tournament Table
create table if not exists public.tournament (
  id text primary key,
  name text not null,
  status text not null,
  format text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Teams Table
create table if not exists public.teams (
  id text primary key,
  name text not null,
  short_name text not null,
  logo text,
  color text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Players Table (With Foreign Key Cascade Deletes for dynamic roster clearing)
-- When a team is completely deleted, or when individual player slots are cleared in the admin UI,
-- the system propagates the changes down to this table to keep active rosters synchronized.
create table if not exists public.players (
  id text primary key,
  team_id text references public.teams(id) on delete cascade not null,
  name text not null,
  status text not null check (status in ('alive', 'knocked', 'eliminated')),
  kills integer default 0 not null,
  damage integer default 0 not null,
  photo text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Standings Table
create table if not exists public.standings (
  team_id text primary key references public.teams(id) on delete cascade not null,
  rank integer not null,
  total_points integer default 0 not null,
  total_kills integer default 0 not null,
  placement_points integer default 0 not null,
  kill_points integer default 0 not null,
  wwcd integer default 0 not null,
  matches_json jsonb default '[]'::jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Kill Feed Table
create table if not exists public.kill_feed (
  id text primary key,
  killer_id text,
  killer_name text not null,
  killer_team text not null,
  victim_id text,
  victim_name text not null,
  victim_team text not null,
  weapon text not null,
  is_knock boolean default false not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Overlay Config Table
create table if not exists public.overlay_config (
  id text primary key,
  show_rankings boolean default true not null,
  show_kill_feed boolean default true not null,
  show_team_status boolean default true not null,
  show_match_info boolean default true not null,
  show_player_cam boolean default false not null,
  theme text default 'default' not null,
  animations_enabled boolean default true not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Sponsors Table
create table if not exists public.sponsors (
  id text primary key,
  name text not null,
  logo_url text,
  video_url text,
  media_type text default 'image' not null check (media_type in ('image', 'video')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Admins Table (Privileged users able to perform director actions)
-- This table supports any number of admin emails. Add rows here for every account
-- that should be allowed to perform director/admin-level actions.
create table if not exists public.admins (
  email text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed placeholder admin (update with your real admin emails in Supabase SQL editor)
insert into public.admins (email) values ('admin@example.com') on conflict do nothing;

-- 9. Events Table for detailed realtime event tracking (kills/knocks/team eliminations)
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  match_id text,
  team_id text,
  actor_id text,
  actor_name text,
  target_id text,
  target_name text,
  type text not null check (type in ('knock','kill','revive','team_elim')),
  weapon text,
  meta jsonb default '{}'::jsonb,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Enable Row Level Security (RLS) across all tables
alter table public.tournament enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.standings enable row level security;
alter table public.kill_feed enable row level security;
alter table public.overlay_config enable row level security;
alter table public.sponsors enable row level security;
alter table public.admins enable row level security;
alter table public.events enable row level security;

-- 10.a Ensure Supabase client roles can access the public schema
grant usage on schema public to authenticated;
grant usage on schema public to anon;

-- 11. Drop any existing policies so this script can be rerun safely
-- Tournament
drop policy if exists "Public read tournament" on public.tournament;
drop policy if exists "Public write tournament" on public.tournament;
drop policy if exists "Authenticated write tournament" on public.tournament;

-- Teams
drop policy if exists "Public read teams" on public.teams;
drop policy if exists "Public write teams" on public.teams;
drop policy if exists "Authenticated write teams" on public.teams;

-- Players
drop policy if exists "Public read players" on public.players;
drop policy if exists "Public write players" on public.players;
drop policy if exists "Authenticated write players" on public.players;

-- Standings
drop policy if exists "Public read standings" on public.standings;
drop policy if exists "Public write standings" on public.standings;
drop policy if exists "Authenticated write standings" on public.standings;

-- Kill feed
drop policy if exists "Public read kill_feed" on public.kill_feed;
drop policy if exists "Public write kill_feed" on public.kill_feed;
drop policy if exists "Admins write kill_feed" on public.kill_feed;

-- Overlay config
drop policy if exists "Public read overlay_config" on public.overlay_config;
drop policy if exists "Public write overlay_config" on public.overlay_config;
drop policy if exists "Admins write overlay_config" on public.overlay_config;

-- Sponsors
drop policy if exists "Public read sponsors" on public.sponsors;
drop policy if exists "Public write sponsors" on public.sponsors;
drop policy if exists "Authenticated write sponsors" on public.sponsors;

-- Admins
drop policy if exists "Public read admins" on public.admins;
drop policy if exists "Admins manage admins" on public.admins;

-- Events
drop policy if exists "Public read events" on public.events;
drop policy if exists "Admins write events" on public.events;

-- 12. Create policies
create policy "Public read tournament" on public.tournament for select using (true);
create policy "Authenticated write tournament" on public.tournament for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read teams" on public.teams for select using (true);
create policy "Authenticated write teams" on public.teams for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read players" on public.players for select using (true);
create policy "Authenticated write players" on public.players for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read standings" on public.standings for select using (true);
create policy "Authenticated write standings" on public.standings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read kill_feed" on public.kill_feed for select using (true);
create policy "Admins write kill_feed" on public.kill_feed for all using (
  auth.role() = 'authenticated' and exists (select 1 from public.admins where email = auth.jwt() ->> 'email')
);

create policy "Public read overlay_config" on public.overlay_config for select using (true);
create policy "Admins write overlay_config" on public.overlay_config for all using (
  auth.role() = 'authenticated' and exists (select 1 from public.admins where email = auth.jwt() ->> 'email')
);

create policy "Public read sponsors" on public.sponsors for select using (true);
create policy "Authenticated write sponsors" on public.sponsors for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read admins" on public.admins for select using (
  auth.role() = 'authenticated' and exists (select 1 from public.admins where email = auth.jwt() ->> 'email')
);
create policy "Admins manage admins" on public.admins for all using (
  auth.role() = 'authenticated' and exists (select 1 from public.admins where email = auth.jwt() ->> 'email')
);

create policy "Public read events" on public.events for select using (true);
create policy "Admins write events" on public.events for all using (
  auth.role() = 'authenticated' and exists (select 1 from public.admins where email = auth.jwt() ->> 'email')
);

-- 13. Add all tables to the supabase_realtime publication
alter publication supabase_realtime add table public.tournament;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.standings;
alter publication supabase_realtime add table public.kill_feed;
alter publication supabase_realtime add table public.overlay_config;
alter publication supabase_realtime add table public.sponsors;
alter publication supabase_realtime add table public.admins;
alter publication supabase_realtime add table public.events;


