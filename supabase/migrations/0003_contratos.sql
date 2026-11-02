-- 0003 · Arrendatarios (con alias para el importador), contratos, unidades por
-- contrato y condiciones versionadas (historial de renta).

create type public.lease_status as enum ('draft', 'active', 'expired', 'terminated', 'void');
create type public.periodicity as enum ('monthly', 'bimonthly', 'quarterly', 'annual', 'variable');
create type public.tax_treatment as enum ('iva_incluido', 'mas_iva', 'exento');

-- ---------------------------------------------------------------- arrendatarios
create table public.tenants (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  display_name  text not null,          -- nombre corto como aparece en reportes
  legal_name    text,
  kind          public.entity_kind not null default 'persona_moral',
  pays_cash     boolean not null default false,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (org_id, display_name)
);
create trigger trg_tenants_updated before update on public.tenants
  for each row execute function public.set_updated_at();

-- Datos protegidos: solo admin/operator.
create table public.tenant_details (
  tenant_id   uuid primary key references public.tenants(id) on delete cascade,
  org_id      uuid not null references public.organizations(id) on delete cascade,
  rfc         text,
  contact_name text,
  email       text,
  phone       text,
  address     text,
  updated_at  timestamptz not null default now()
);
create trigger trg_tenant_details_updated before update on public.tenant_details
  for each row execute function public.set_updated_at();

-- Variantes con que el Excel escribe al mismo cliente ("OXXO", "Oxxo S.A. de C.V.", …).
create table public.tenant_aliases (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  alias       extensions.citext not null,
  created_at  timestamptz not null default now(),
  unique (org_id, alias)
);
create index tenant_aliases_tenant_idx on public.tenant_aliases (tenant_id);

-- Normaliza un nombre de cliente como lo escribe el Excel: minúsculas, sin
-- acentos, espacios colapsados, sin puntuación de razón social.
create or replace function public.normalize_name(p text)
returns text language sql immutable as $$
  select trim(regexp_replace(
           regexp_replace(lower(extensions.unaccent(coalesce(p, ''))), '[.,]', '', 'g'),
           '\s+', ' ', 'g'))
$$;

-- ---------------------------------------------------------------- contratos
create table public.leases (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations(id) on delete cascade,
  code               text,
  tenant_id          uuid not null references public.tenants(id),
  lessor_entity_id   uuid references public.legal_entities(id),
  development_id     uuid references public.developments(id),
  status             public.lease_status not null default 'active',
  start_date         date,
  end_date           date,                       -- null = sin vencimiento registrado (hallazgo)
  signed_at          date,
  source             text not null default 'excel',   -- excel | contrato_pdf | captura
  verification       public.verification_status not null default 'por_verificar',
  contract_document_id uuid,                    -- FK a documents en 0005
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint leases_dates check (end_date is null or start_date is null or end_date >= start_date)
);
create index leases_tenant_idx on public.leases (tenant_id);
create index leases_development_idx on public.leases (development_id);
create index leases_org_status_idx on public.leases (org_id, status);
create trigger trg_leases_updated before update on public.leases
  for each row execute function public.set_updated_at();
create trigger trg_leases_audit after insert or update or delete on public.leases
  for each row execute function public.audit_row();

-- Unidades que cubre cada contrato (multiunidad). m² rentados por unidad.
create table public.lease_units (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  lease_id    uuid not null references public.leases(id) on delete cascade,
  unit_id     uuid not null references public.units(id),
  rented_m2   numeric(12,2),
  share_pct   numeric(7,4),
  created_at  timestamptz not null default now(),
  unique (lease_id, unit_id)
);
create index lease_units_unit_idx on public.lease_units (unit_id);

-- Invariante: nada operable sobre unidades de referencia (terceros).
create or replace function public.reject_reference_only_unit()
returns trigger language plpgsql as $$
begin
  if new.unit_id is not null and exists (
       select 1 from public.units u where u.id = new.unit_id and u.reference_only) then
    raise exception 'La unidad % es de referencia (terceros): no admite contratos, cargos ni gastos.', new.unit_id
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger trg_lease_units_reference before insert or update on public.lease_units
  for each row execute function public.reject_reference_only_unit();

-- ---------------------------------------------------------------- condiciones versionadas
-- Una fila por cambio de renta/mantenimiento. Sustituye los ajustes manuales
-- del Excel (renta_anterior × n + renta_nueva × m). Montos CON IVA cuando
-- tax_treatment = 'iva_incluido' (así los captura el reporte).
create table public.lease_terms (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations(id) on delete cascade,
  lease_id           uuid not null references public.leases(id) on delete cascade,
  effective_from     date not null,
  effective_to       date,
  rent_total         numeric(14,2) not null check (rent_total >= 0),   -- renta mensual pactada
  maintenance_total  numeric(14,2) not null default 0 check (maintenance_total >= 0),
  currency           char(3) not null default 'MXN',
  periodicity        public.periodicity not null default 'monthly',
  tax_treatment      public.tax_treatment not null default 'iva_incluido',
  tax_rate           numeric(5,4) not null default 0.16,
  due_day            smallint check (due_day between 1 and 31),
  deposit_amount     numeric(14,2),
  increase_rule      jsonb,              -- solo si está documentado en el contrato
  source             text not null default 'excel',
  notes              text,
  created_by         uuid references public.profiles(id),
  created_at         timestamptz not null default now(),
  constraint lease_terms_dates check (effective_to is null or effective_to >= effective_from),
  constraint lease_terms_no_overlap exclude using gist (
    lease_id with =,
    daterange(effective_from, coalesce(effective_to, 'infinity'::date), '[]') with &&
  )
);
create index lease_terms_lease_idx on public.lease_terms (lease_id, effective_from desc);
create trigger trg_lease_terms_audit after insert or update or delete on public.lease_terms
  for each row execute function public.audit_row();

-- Renta sin IVA e IVA derivados (regla 2 del Excel: importe = total / 1.16).
create or replace view public.lease_terms_breakdown
with (security_invoker = true) as
select
  t.*,
  case when t.tax_treatment = 'iva_incluido' then round(t.rent_total / (1 + t.tax_rate), 2)
       else t.rent_total end as rent_subtotal,
  case when t.tax_treatment = 'iva_incluido' then t.rent_total - round(t.rent_total / (1 + t.tax_rate), 2)
       when t.tax_treatment = 'mas_iva' then round(t.rent_total * t.tax_rate, 2)
       else 0 end as rent_tax
from public.lease_terms t;

-- Condición vigente de un contrato en una fecha.
create or replace function public.lease_term_at(p_lease uuid, p_date date)
returns public.lease_terms language sql stable set search_path = public as $$
  select t.* from public.lease_terms t
  where t.lease_id = p_lease
    and t.effective_from <= p_date
    and (t.effective_to is null or t.effective_to >= p_date)
  order by t.effective_from desc limit 1
$$;
