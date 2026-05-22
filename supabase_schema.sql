-- PUBG Live Production System Supabase Relational Database Schema Setup
-- Run this in your Supabase SQL Editor to initialize all relational tables.

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

-- 3. Players Table (With Foreign Key Cascade Deletes for dynamic Roster clearing)
-- When a team is completely deleted, or when individual player slots are cleared in the admin UI,
-- the system propagates the changes down to this table to keep the active rosters fully synchronized.
create table if not exists public.players (
  id text primary key,
  team_id text references public.teams(id) on delete cascade not null, -- Cascade deletes automatically clear player rows when a team is removed
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

-- 8. Enable Row Level Security (RLS) across all tables
alter table public.tournament enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.standings enable row level security;
alter table public.kill_feed enable row level security;
alter table public.overlay_config enable row level security;
alter table public.sponsors enable row level security;

-- 9. Grant schema and table privileges to Supabase client roles
-- This avoids Postgres schema-level access errors like "permission denied for schema public"
grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on all tables in schema public to authenticated, anon;
grant usage on all sequences in schema public to authenticated, anon;

alter default privileges in schema public grant select, insert, update, delete on tables to authenticated, anon;
alter default privileges in schema public grant usage on sequences to authenticated, anon;

-- 10. Create unified public read and write access policies
-- (Allows easy client-side updates without needing complex authentication flows)

create policy "Public read tournament" on public.tournament for select using (true);
create policy "Public write tournament" on public.tournament for all using (true) with check (true);

create policy "Public read teams" on public.teams for select using (true);
create policy "Public write teams" on public.teams for all using (true) with check (true);

create policy "Public read players" on public.players for select using (true);
create policy "Public write players" on public.players for all using (true) with check (true);

create policy "Public read standings" on public.standings for select using (true);
create policy "Public write standings" on public.standings for all using (true) with check (true);

create policy "Public read kill_feed" on public.kill_feed for select using (true);
create policy "Public write kill_feed" on public.kill_feed for all using (true) with check (true);

create policy "Public read overlay_config" on public.overlay_config for select using (true);
create policy "Public write overlay_config" on public.overlay_config for all using (true) with check (true);

create policy "Public read sponsors" on public.sponsors for select using (true);
create policy "Public write sponsors" on public.sponsors for all using (true) with check (true);

-- 10. Add all tables to the supabase_realtime publication
alter publication supabase_realtime add table public.tournament;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.standings;
alter publication supabase_realtime add table public.kill_feed;
alter publication supabase_realtime add table public.overlay_config;
alter publication supabase_realtime add table public.sponsors;

-- 11. Strict Single-Admin Security Guard Constraint
-- Prevents any unauthorized third-party registrations or database growth by restricting auth.users to exactly 1.
create or replace function public.limit_admin_count()
returns trigger as $$
declare
  admin_count integer;
begin
  select count(*) into admin_count from auth.users;
  if admin_count >= 1 then
    raise exception 'Access Denied: Only one administrative account is permitted in this system.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it already exists to prevent duplicate execution errors
drop trigger if exists limit_admin_signup on auth.users;

-- Bind the trigger BEFORE INSERT on auth.users to block registrations before they save
create trigger limit_admin_signup
before insert on auth.users
for each row
execute function public.limit_admin_count();


