-- =============================================================
-- Add User Tier Column
-- =============================================================
-- 'seed', 'bloom', 'forest' tiers to track user subscription status

-- 1. Create Enum Type if not exists
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_tier') then
    create type user_tier as enum ('seed', 'bloom', 'forest');
  end if;
end $$;

-- 2. Add tier column to profiles
alter table public.profiles
  add column if not exists tier user_tier not null default 'seed';

-- 3. Add index for faster queries
create index if not exists idx_profiles_tier on public.profiles(tier);
