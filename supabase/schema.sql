-- Niners Gameday — Supabase schema
-- Run this in the Supabase SQL Editor first.

create extension if not exists "pgcrypto";

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  week int not null,
  opponent text not null,
  opponent_abbr text not null,
  kickoff_at timestamptz not null,
  tv_network text,
  label text,
  plan_type text check (plan_type in ('joint_tailgate','redzone_rally','separate_parties')),
  parking_bought boolean default false,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  crew text not null check (crew in ('tounger','mendi')),
  name text not null,
  is_host boolean default false,
  display_order int default 0,
  created_at timestamptz default now()
);

create table if not exists tailgate_items (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  item_name text not null,
  assignee text,
  category text check (category in ('mains','sides','drinks','desserts','supplies')) default 'mains',
  display_order int default 0,
  created_at timestamptz default now()
);

-- Open-access mode: disable RLS (the app is unauthenticated)
alter table games disable row level security;
alter table guests disable row level security;
alter table tailgate_items disable row level security;

-- Enable realtime for multi-user sync.
-- Wrapped in DO blocks so re-running the schema is safe (Postgres will throw
-- if a table is already in the publication).
do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'games'
  ) then
    execute 'alter publication supabase_realtime add table games';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'guests'
  ) then
    execute 'alter publication supabase_realtime add table guests';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'tailgate_items'
  ) then
    execute 'alter publication supabase_realtime add table tailgate_items';
  end if;
end $$;
