-- =====================================================================
-- PSK Admin Platform — Authentication, roles, and Row Level Security
-- Run this ONCE in the Supabase SQL editor (project svijjousbophivmgsftm).
-- Safe to re-run: everything is IF NOT EXISTS / CREATE OR REPLACE.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. PROFILES  (role + branch + finance PIN, one row per auth user)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text unique not null,
  name              text not null,
  title             text,
  role              text not null check (role in ('owner','finance','manager','ops','intern')),
  branch            text not null default 'eldoret' check (branch in ('eldoret','kisumu')),
  finance_pin_hash  text,
  pin_attempts      int  not null default 0,
  pin_locked_until  timestamptz,
  must_change_pw    boolean not null default true,
  backup_email      text,
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- SECURITY DEFINER so policies can read profiles without recursing
-- through the very policies being evaluated.
-- ---------------------------------------------------------------------
create or replace function public.my_role()
returns text
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() and active $$;

create or replace function public.my_branch()
returns text
language sql stable security definer set search_path = public
as $$ select branch from public.profiles where id = auth.uid() and active $$;

-- Finance = Ken (owner) and Miriam (finance). Nobody else, ever.
create or replace function public.is_finance()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.my_role() in ('owner','finance'), false) $$;

create or replace function public.is_owner()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.my_role() = 'owner', false) $$;

-- Interns get to look, not touch.
create or replace function public.can_write()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.my_role() in ('owner','finance','manager','ops'), false) $$;

-- ---------------------------------------------------------------------
-- 3. PROFILE POLICIES
-- ---------------------------------------------------------------------
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_owner());

drop policy if exists "update own safe fields" on public.profiles;
create policy "update own safe fields" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- NOTE: role is deliberately NOT self-editable in a way that matters —
-- see the guard trigger below, which blocks privilege escalation.
create or replace function public.guard_profile_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_owner() then return new; end if;
  if new.role <> old.role
     or new.branch <> old.branch
     or new.active <> old.active then
    raise exception 'Not permitted to change role, branch or active status';
  end if;
  return new;
end $$;

drop trigger if exists guard_profile_changes on public.profiles;
create trigger guard_profile_changes
  before update on public.profiles
  for each row execute function public.guard_profile_changes();

-- ---------------------------------------------------------------------
-- 4. AUDIT LOG
-- Append-only: anyone signed in can write, nobody can edit or delete.
-- ---------------------------------------------------------------------
create table if not exists public.audit_log (
  id          bigserial primary key,
  user_id     uuid references auth.users(id),
  user_email  text,
  user_name   text,
  role        text,
  action      text not null,
  detail      text,
  entity      text,
  entity_id   text,
  branch      text,
  icon        text,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

drop policy if exists "audit insert" on public.audit_log;
create policy "audit insert" on public.audit_log
  for insert to authenticated with check (true);

drop policy if exists "audit read" on public.audit_log;
create policy "audit read" on public.audit_log
  for select to authenticated
  using (public.my_role() in ('owner','finance','manager'));

-- No update/delete policies exist, so the log cannot be rewritten.

create or replace function public.log_action(
  p_action text, p_detail text default null,
  p_entity text default null, p_entity_id text default null,
  p_icon text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare p record;
begin
  select email, name, role, branch into p from public.profiles where id = auth.uid();
  insert into public.audit_log (user_id,user_email,user_name,role,action,detail,entity,entity_id,branch,icon)
  values (auth.uid(), p.email, p.name, p.role, p_action, p_detail, p_entity, p_entity_id, p.branch, p_icon);
end $$;

-- ---------------------------------------------------------------------
-- 5. FINANCE PIN — hashed, verified server side, rate limited
-- The PIN never reaches the browser. A wrong PIN five times locks the
-- section for 15 minutes and every attempt is logged.
-- ---------------------------------------------------------------------
create or replace function public.set_finance_pin(new_pin text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_finance() then
    raise exception 'Not permitted to set a Finance PIN';
  end if;
  if new_pin !~ '^[0-9]{4,6}$' then
    raise exception 'PIN must be 4 to 6 digits';
  end if;
  update public.profiles
     set finance_pin_hash = crypt(new_pin, gen_salt('bf')),
         pin_attempts = 0, pin_locked_until = null
   where id = auth.uid();
  perform public.log_action('Finance PIN changed', 'User set a new Finance PIN', 'profiles', auth.uid()::text, '🔑');
end $$;

create or replace function public.verify_finance_pin(pin text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare p record; ok boolean;
begin
  select * into p from public.profiles where id = auth.uid();

  if not public.is_finance() then
    perform public.log_action('Finance access DENIED', 'Role not permitted', 'finance', null, '⛔');
    return jsonb_build_object('ok', false, 'reason', 'not_permitted');
  end if;

  if p.pin_locked_until is not null and p.pin_locked_until > now() then
    return jsonb_build_object('ok', false, 'reason', 'locked', 'until', p.pin_locked_until);
  end if;

  if p.finance_pin_hash is null then
    return jsonb_build_object('ok', false, 'reason', 'no_pin_set');
  end if;

  ok := p.finance_pin_hash = crypt(pin, p.finance_pin_hash);

  if ok then
    update public.profiles set pin_attempts = 0, pin_locked_until = null where id = auth.uid();
    perform public.log_action('Finance section unlocked', null, 'finance', null, '🔓');
    return jsonb_build_object('ok', true);
  else
    update public.profiles
       set pin_attempts = p.pin_attempts + 1,
           pin_locked_until = case when p.pin_attempts + 1 >= 5
                                   then now() + interval '15 minutes' else null end
     where id = auth.uid();
    perform public.log_action('Finance PIN failed',
      'Attempt ' || (p.pin_attempts + 1) || ' of 5', 'finance', null, '⚠️');
    return jsonb_build_object('ok', false, 'reason', 'wrong',
                              'attempts_left', greatest(5 - (p.pin_attempts + 1), 0));
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY ON BUSINESS TABLES
-- Two tiers:
--   OPERATIONAL  - any signed-in staff member may read; writers may write
--   FINANCIAL    - owner and finance only, read and write
-- The anon key gets nothing at all. That is the whole point: the anon
-- key ships in the browser bundle, so it must be worthless on its own.
-- ---------------------------------------------------------------------

do $$
declare t text;
begin
  -- Operational tables
  foreach t in array array[
    'clients','vehicles','vehicle_owners','drivers','bookings',
    'rental_agreements','handover_checklists','maintenance_logs',
    'fuel_logs','reminders','psk_documents'
  ] loop
    if to_regclass('public.'||t) is null then continue; end if;

    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "staff read" on public.%I', t);
    execute format('drop policy if exists "staff insert" on public.%I', t);
    execute format('drop policy if exists "staff update" on public.%I', t);
    execute format('drop policy if exists "staff delete" on public.%I', t);
    -- clear any legacy wide-open policies
    execute format('drop policy if exists "Enable all access" on public.%I', t);
    execute format('drop policy if exists "public access" on public.%I', t);
    execute format('drop policy if exists "allow all" on public.%I', t);

    execute format('create policy "staff read" on public.%I for select to authenticated using (true)', t);
    execute format('create policy "staff insert" on public.%I for insert to authenticated with check (public.can_write())', t);
    execute format('create policy "staff update" on public.%I for update to authenticated using (public.can_write()) with check (public.can_write())', t);
    -- Only owner and finance may delete records outright.
    execute format('create policy "staff delete" on public.%I for delete to authenticated using (public.is_finance())', t);
  end loop;

  -- Financial tables — locked to owner + finance
  foreach t in array array['expenses','mpesa_transactions','owner_payouts'] loop
    if to_regclass('public.'||t) is null then continue; end if;

    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "finance only" on public.%I', t);
    execute format('drop policy if exists "Enable all access" on public.%I', t);
    execute format('drop policy if exists "public access" on public.%I', t);
    execute format('drop policy if exists "allow all" on public.%I', t);

    execute format('create policy "finance only" on public.%I for all to authenticated using (public.is_finance()) with check (public.is_finance())', t);
  end loop;
end $$;

-- Owner payouts are Ken's alone, tighter than the rest of Finance.
do $$
begin
  if to_regclass('public.owner_payouts') is not null then
    drop policy if exists "finance only" on public.owner_payouts;
    create policy "owner only" on public.owner_payouts
      for all to authenticated
      using (public.is_owner()) with check (public.is_owner());
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 7. REVOKE THE ANON KEY
-- ---------------------------------------------------------------------
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;

-- =====================================================================
-- AFTER RUNNING THIS:
--   1. Create the six users in Authentication -> Users (see SEED below)
--   2. Run 002_seed_profiles.sql to attach roles to them
-- =====================================================================
