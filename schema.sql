-- ============================================
-- noPlans — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================

-- Groups table
create table if not exists groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text unique not null default upper(substring(md5(random()::text), 1, 6)),
  created_at  timestamptz default now()
);

-- Activities table
create table if not exists activities (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid references groups(id) on delete cascade not null,
  title      text not null,
  emoji      text not null default '🎯',
  tag        text,
  votes      integer default 0 not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists activities_group_id_idx on activities(group_id);
create index if not exists groups_invite_code_idx on groups(invite_code);

-- ============================================
-- RLS (Row Level Security)
-- For the MVP we keep it open — add auth later
-- ============================================
alter table groups   enable row level security;
alter table activities enable row level security;

-- Open policies for prototype (no auth required)
create policy "public read groups"      on groups      for select using (true);
create policy "public insert groups"    on groups      for insert with check (true);
create policy "public read activities"  on activities  for select using (true);
create policy "public insert activities" on activities for insert with check (true);
create policy "public update activities" on activities for update using (true);
create policy "public delete activities" on activities for delete using (true);

-- ============================================
-- Realtime — enable for activities table
-- ============================================
alter publication supabase_realtime add table activities;