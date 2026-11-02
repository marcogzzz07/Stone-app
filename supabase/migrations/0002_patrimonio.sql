-- 0002 · Patrimonio: entidades legales, desarrollos, activos, unidades,
-- titularidad, superficies y geometrías (PostGIS, EPSG:4326).

create type public.entity_kind as enum ('persona_fisica', 'persona_moral');
create type public.asset_kind as enum ('terreno', 'edificio', 'predio', 'nave', 'otro');
create type public.unit_kind as enum ('bodega', 'local', 'oficina', 'terreno', 'lote', 'departamento', 'edificio', 'otro');
create type public.occupancy_status as enum ('unknown', 'occupied', 'vacant', 'unavailable');
create type public.unit_lifecycle as enum ('active', 'prospect', 'sold', 'inactive');
create type public.surface_kind as enum ('legal', 'cadastral', 'built', 'rentable', 'gis_estimate');
create type public.verification_status as enum ('confirmado', 'por_verificar', 'no_disponible');
create type public.geometry_target as enum ('development', 'asset', 'unit');

-- ---------------------------------------------------------------- entidades legales
-- Propietarios, arrendadores y administradores. Datos sensibles (RFC, contacto)
-- en tabla aparte con RLS más estricta.
create table public.legal_entities (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  name        text not null,
  kind        public.entity_kind not null default 'persona_moral',
  is_stone    boolean not null default false,   -- entidad del grupo (vs. tercero/copropietario)
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index legal_entities_org_idx on public.legal_entities (org_id);
create trigger trg_legal_entities_updated before update on public.legal_entities
  for each row execute function public.set_updated_at();

create table public.legal_entity_details (
  entity_id   uuid primary key references public.legal_entities(id) on delete cascade,
  org_id      uuid not null references public.organizations(id) on delete cascade,
  rfc         text,
  email       text,
  phone       text,
  address     text,
  updated_at  timestamptz not null default now()
);
create trigger trg_legal_entity_details_updated before update on public.legal_entity_details
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- desarrollos
create table public.developments (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  code          text not null,
  name          text not null,
  city          text,
  state         text,
  address       text,
  description   text,
  chart_order   smallint,                 -- orden fijo de la paleta chart-1…7 del brand book
  is_shared     boolean not null default false, -- hay unidades de terceros (D06)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (org_id, code)
);
create trigger trg_developments_updated before update on public.developments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- activos
create table public.assets (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id) on delete cascade,
  development_id   uuid references public.developments(id) on delete set null,
  parent_asset_id  uuid references public.assets(id) on delete set null,
  code             text not null,
  name             text not null,
  kind             public.asset_kind not null default 'otro',
  address          text,
  cadastral_key    text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (org_id, code)
);
create index assets_development_idx on public.assets (development_id);
create trigger trg_assets_updated before update on public.assets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- unidades
create table public.units (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references public.organizations(id) on delete cascade,
  development_id      uuid references public.developments(id) on delete set null,
  asset_id            uuid references public.assets(id) on delete set null,
  code                text not null,
  name                text not null,
  kind                public.unit_kind not null default 'otro',
  reference_only      boolean not null default false,  -- unidad de terceros: solo contexto (D06)
  managed_by_org_id   uuid references public.organizations(id),
  owner_entity_id     uuid references public.legal_entities(id),
  lifecycle           public.unit_lifecycle not null default 'active',
  occupancy           public.occupancy_status not null default 'unknown',
  floor_label         text,
  description         text,
  list_rent           numeric(14,2),         -- renta de lista (con IVA) para unidades disponibles
  list_rent_currency  char(3) not null default 'MXN',
  list_rate_m2        numeric(10,2),         -- tarifa/m² (Playa: 144, 160, 575)
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (org_id, code),
  constraint units_reference_has_no_manager
    check (not reference_only or managed_by_org_id is null)
);
create index units_development_idx on public.units (development_id);
create index units_asset_idx on public.units (asset_id);
create trigger trg_units_updated before update on public.units
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- titularidad
create table public.ownership_interests (
  id                   uuid primary key default gen_random_uuid(),
  org_id               uuid not null references public.organizations(id) on delete cascade,
  entity_id            uuid not null references public.legal_entities(id),
  asset_id             uuid references public.assets(id) on delete cascade,
  unit_id              uuid references public.units(id) on delete cascade,
  share_pct            numeric(7,4) not null default 100 check (share_pct > 0 and share_pct <= 100),
  valid_from           date,
  valid_to             date,
  source_document_id   uuid,              -- FK a documents se agrega en 0005
  verification         public.verification_status not null default 'por_verificar',
  created_at           timestamptz not null default now(),
  constraint ownership_one_target check (num_nonnulls(asset_id, unit_id) = 1)
);
create index ownership_asset_idx on public.ownership_interests (asset_id);
create index ownership_unit_idx on public.ownership_interests (unit_id);

-- ---------------------------------------------------------------- superficies
create table public.surfaces (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  target_type   public.geometry_target not null,
  target_id     uuid not null,
  kind          public.surface_kind not null,
  value_m2      numeric(12,2) not null check (value_m2 >= 0),
  source        text,                      -- 'excel', 'escritura', 'plano', 'gis'
  verification  public.verification_status not null default 'por_verificar',
  captured_at   date,
  created_at    timestamptz not null default now(),
  unique (target_type, target_id, kind)
);

-- ---------------------------------------------------------------- geometrías
create table public.geometries (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id) on delete cascade,
  target_type    public.geometry_target not null,
  target_id      uuid not null,
  geom           extensions.geography(Geometry, 4326) not null,
  geom_type      text generated always as (extensions.geometrytype(geom::extensions.geometry)) stored,
  srid_source    integer,
  source         text,
  precision_m    numeric(8,2),
  method         text,
  captured_at    date,
  version        integer not null default 1,
  is_current     boolean not null default true,
  area_m2_est    numeric(14,2) generated always as (extensions.st_area(geom)) stored,
  perimeter_m_est numeric(14,2) generated always as (extensions.st_perimeter(geom)) stored,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now()
);
create index geometries_target_idx on public.geometries (target_type, target_id) where is_current;
create index geometries_geom_idx on public.geometries using gist (geom);
create unique index geometries_one_current
  on public.geometries (target_type, target_id) where is_current;
