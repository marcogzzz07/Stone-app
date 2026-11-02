-- 0001 · Extensiones, organización, perfiles, membresías, invitaciones, auditoría.
-- Convenciones: uuid PK, org_id en toda tabla expuesta, created_at/updated_at.

create extension if not exists postgis with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------- tipos
create type public.app_role as enum ('admin', 'operator', 'viewer');
create type public.membership_status as enum ('active', 'suspended');
create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');

-- ---------------------------------------------------------------- utilidades
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- organizaciones
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_organizations_updated before update on public.organizations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- perfiles (1:1 auth.users)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        extensions.citext not null unique,
  full_name    text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- membresías
create table public.memberships (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  role        public.app_role not null default 'viewer',
  status      public.membership_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, profile_id)
);
create index memberships_profile_idx on public.memberships (profile_id);
create trigger trg_memberships_updated before update on public.memberships
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- invitaciones (ingreso solo por invitación)
create table public.invitations (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  email        extensions.citext not null,
  role         public.app_role not null default 'viewer',
  status       public.invitation_status not null default 'pending',
  invited_by   uuid references public.profiles(id),
  expires_at   timestamptz not null default now() + interval '7 days',
  accepted_at  timestamptz,
  created_at   timestamptz not null default now()
);
create unique index invitations_pending_unique
  on public.invitations (org_id, email) where status = 'pending';

-- ---------------------------------------------------------------- funciones de autorización
-- Todas son STABLE + SECURITY DEFINER con search_path fijo para usarse en RLS
-- sin recursión sobre memberships.
create or replace function public.auth_org_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select m.org_id
  from public.memberships m
  where m.profile_id = (select auth.uid()) and m.status = 'active'
$$;

create or replace function public.auth_role(p_org uuid)
returns public.app_role
language sql stable security definer set search_path = public as $$
  select m.role
  from public.memberships m
  where m.profile_id = (select auth.uid()) and m.org_id = p_org and m.status = 'active'
  limit 1
$$;

create or replace function public.is_member(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    where m.profile_id = (select auth.uid()) and m.org_id = p_org and m.status = 'active')
$$;

create or replace function public.has_role(p_org uuid, variadic p_roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    where m.profile_id = (select auth.uid()) and m.org_id = p_org
      and m.status = 'active' and m.role = any (p_roles))
$$;

revoke execute on function public.auth_org_ids() from anon;
revoke execute on function public.auth_role(uuid) from anon;
revoke execute on function public.is_member(uuid) from anon;
revoke execute on function public.has_role(uuid, public.app_role[]) from anon;

-- ---------------------------------------------------------------- alta de usuario
-- Al crearse un usuario en auth (vía invitación), se crea su perfil y, si hay
-- una invitación pendiente y vigente para su correo, su membresía con el rol
-- invitado. Sin invitación no obtiene membresía → RLS no le muestra nada.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  inv record;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  for inv in
    select * from public.invitations
    where email = new.email and status = 'pending' and expires_at > now()
  loop
    insert into public.memberships (org_id, profile_id, role)
    values (inv.org_id, new.id, inv.role)
    on conflict (org_id, profile_id) do update set role = excluded.role, status = 'active';
    update public.invitations set status = 'accepted', accepted_at = now() where id = inv.id;
  end loop;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- auditoría
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  org_id      uuid,
  actor_id    uuid,
  action      text not null,             -- INSERT | UPDATE | DELETE
  entity      text not null,             -- nombre de tabla
  entity_id   uuid,
  before      jsonb,
  after       jsonb,
  at          timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs (entity, entity_id);
create index audit_logs_org_at_idx on public.audit_logs (org_id, at desc);

create or replace function public.audit_row()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
  v_id uuid;
begin
  if tg_op = 'DELETE' then
    v_org := (to_jsonb(old)->>'org_id')::uuid; v_id := (to_jsonb(old)->>'id')::uuid;
    insert into public.audit_logs (org_id, actor_id, action, entity, entity_id, before)
    values (v_org, auth.uid(), tg_op, tg_table_name, v_id, to_jsonb(old));
    return old;
  else
    v_org := (to_jsonb(new)->>'org_id')::uuid; v_id := (to_jsonb(new)->>'id')::uuid;
    insert into public.audit_logs (org_id, actor_id, action, entity, entity_id, before, after)
    values (v_org, auth.uid(), tg_op, tg_table_name, v_id,
            case when tg_op = 'UPDATE' then to_jsonb(old) end, to_jsonb(new));
    return new;
  end if;
end $$;

-- ---------------------------------------------------------------- semilla mínima
insert into public.organizations (slug, name) values ('stone', 'Stone Inmuebles');
