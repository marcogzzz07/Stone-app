-- 0004 · Cargos (facturas), ajustes, pagos, aplicaciones, gastos y prorrateo.
-- El Excel modela 1 factura = 1 pago; aquí pagos y cargos son N:M vía
-- payment_allocations para admitir pagos parciales y anticipos.

create type public.charge_concept as enum ('rent', 'maintenance', 'service', 'other');
create type public.adjustment_kind as enum ('discount', 'credit_note', 'waiver', 'correction', 'reinvoice');
create type public.payment_method as enum ('transfer', 'cash', 'check', 'card', 'other');
create type public.expense_category as enum ('electricity', 'water', 'phone', 'maintenance', 'property_tax', 'insurance', 'repairs', 'admin_fee', 'other');
create type public.expense_classification as enum ('pending', 'stone_expense', 'tenant_passthrough', 'both');

-- ---------------------------------------------------------------- cargos
create table public.charges (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  tenant_id       uuid not null references public.tenants(id),
  lease_id        uuid references public.leases(id),          -- null: renta variable o sin contrato fijo
  unit_id         uuid references public.units(id),
  development_id  uuid references public.developments(id),
  concept         public.charge_concept not null,
  period          date not null,                              -- primer día del mes (columna MES)
  invoice_folio   text,
  invoice_date    date,
  due_date        date,
  subtotal        numeric(14,2) not null check (subtotal >= 0),
  tax_amount      numeric(14,2) not null default 0 check (tax_amount >= 0),
  total           numeric(14,2) generated always as (subtotal + tax_amount) stored,
  currency        char(3) not null default 'MXN',
  voided_at       timestamptz,
  void_reason     text,
  source          text not null default 'excel',
  import_row_id   uuid,                                        -- FK en 0005
  notes           text,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint charges_period_first_day check (period = date_trunc('month', period)::date)
);
create unique index charges_folio_unique on public.charges (org_id, invoice_folio) where invoice_folio is not null;
create index charges_period_idx on public.charges (org_id, period, concept);
create index charges_tenant_idx on public.charges (tenant_id, period);
create index charges_lease_idx on public.charges (lease_id);
create trigger trg_charges_updated before update on public.charges
  for each row execute function public.set_updated_at();
create trigger trg_charges_reference before insert or update on public.charges
  for each row execute function public.reject_reference_only_unit();
create trigger trg_charges_audit after insert or update or delete on public.charges
  for each row execute function public.audit_row();

create table public.charge_adjustments (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  charge_id    uuid not null references public.charges(id) on delete cascade,
  kind         public.adjustment_kind not null,
  amount       numeric(14,2) not null check (amount <> 0),   -- negativo reduce el cargo
  reason       text not null,
  approved_by  uuid references public.profiles(id),
  created_at   timestamptz not null default now()
);
create index charge_adjustments_charge_idx on public.charge_adjustments (charge_id);
create trigger trg_charge_adjustments_audit after insert or update or delete on public.charge_adjustments
  for each row execute function public.audit_row();

-- ---------------------------------------------------------------- pagos
create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  tenant_id       uuid not null references public.tenants(id),
  effective_date  date not null,                 -- FECHA DE PAGO
  amount          numeric(14,2) not null check (amount > 0),
  currency        char(3) not null default 'MXN',
  method          public.payment_method not null default 'transfer',
  bank_ref        text,
  evidence_document_id uuid,                     -- FK en 0005
  source          text not null default 'excel',
  import_row_id   uuid,
  notes           text,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index payments_tenant_date_idx on public.payments (tenant_id, effective_date);
create index payments_org_date_idx on public.payments (org_id, effective_date);
create trigger trg_payments_updated before update on public.payments
  for each row execute function public.set_updated_at();
create trigger trg_payments_audit after insert or update or delete on public.payments
  for each row execute function public.audit_row();

create table public.payment_allocations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  payment_id  uuid not null references public.payments(id) on delete cascade,
  charge_id   uuid not null references public.charges(id),
  amount      numeric(14,2) not null check (amount > 0),
  created_at  timestamptz not null default now(),
  unique (payment_id, charge_id)
);
create index payment_allocations_charge_idx on public.payment_allocations (charge_id);
create trigger trg_payment_allocations_audit after insert or update or delete on public.payment_allocations
  for each row execute function public.audit_row();

-- Invariantes: sum(aplicaciones de un pago) <= pago; sum(aplicaciones de un
-- cargo) <= total del cargo + ajustes; no se aplica a cargos anulados.
create or replace function public.check_allocation_limits()
returns trigger language plpgsql set search_path = public as $$
declare
  v_payment_amount numeric; v_allocated numeric;
  v_charge_net numeric; v_charge_allocated numeric; v_voided timestamptz;
begin
  select amount into v_payment_amount from public.payments where id = new.payment_id;
  select coalesce(sum(amount), 0) into v_allocated
    from public.payment_allocations where payment_id = new.payment_id and id <> new.id;
  if v_allocated + new.amount > v_payment_amount + 0.005 then
    raise exception 'La aplicación excede el monto del pago (% + % > %).', v_allocated, new.amount, v_payment_amount
      using errcode = 'check_violation';
  end if;

  select c.total + coalesce((select sum(a.amount) from public.charge_adjustments a where a.charge_id = c.id), 0),
         c.voided_at
    into v_charge_net, v_voided
    from public.charges c where c.id = new.charge_id;
  if v_voided is not null then
    raise exception 'El cargo % está anulado.', new.charge_id using errcode = 'check_violation';
  end if;
  select coalesce(sum(amount), 0) into v_charge_allocated
    from public.payment_allocations where charge_id = new.charge_id and id <> new.id;
  if v_charge_allocated + new.amount > v_charge_net + 0.005 then
    raise exception 'La aplicación excede el saldo del cargo (% + % > %).', v_charge_allocated, new.amount, v_charge_net
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger trg_payment_allocations_limits before insert or update on public.payment_allocations
  for each row execute function public.check_allocation_limits();

-- ---------------------------------------------------------------- saldos (derivados, nunca almacenados)
create or replace view public.charge_balances
with (security_invoker = true) as
select
  c.id as charge_id,
  c.org_id, c.tenant_id, c.lease_id, c.unit_id, c.development_id,
  c.concept, c.period, c.invoice_folio, c.invoice_date, c.due_date, c.currency,
  c.total,
  coalesce(adj.amount, 0)                       as adjustments,
  c.total + coalesce(adj.amount, 0)             as net_total,
  coalesce(al.amount, 0)                        as paid,
  c.total + coalesce(adj.amount, 0) - coalesce(al.amount, 0) as balance,
  al.last_payment_date,
  c.voided_at is not null                       as is_void,
  case
    when c.voided_at is not null then 'void'
    when coalesce(al.amount, 0) >= c.total + coalesce(adj.amount, 0) - 0.005 then 'paid'
    when coalesce(al.amount, 0) > 0 then 'partially_paid'
    when c.due_date is not null and c.due_date < current_date then 'overdue'
    else 'open'
  end as status
from public.charges c
left join lateral (
  select sum(a.amount) as amount from public.charge_adjustments a where a.charge_id = c.id
) adj on true
left join lateral (
  select sum(pa.amount) as amount, max(p.effective_date) as last_payment_date
  from public.payment_allocations pa join public.payments p on p.id = pa.payment_id
  where pa.charge_id = c.id
) al on true;

-- ---------------------------------------------------------------- gastos
create table public.expenses (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id) on delete cascade,
  development_id   uuid references public.developments(id),
  asset_id         uuid references public.assets(id),
  unit_id          uuid references public.units(id),
  category         public.expense_category not null,
  vendor           text,
  period           date,                                     -- mes de consumo
  charged_at       date,
  subtotal         numeric(14,2) not null check (subtotal >= 0),
  tax_amount       numeric(14,2) not null default 0 check (tax_amount >= 0),
  total            numeric(14,2) generated always as (subtotal + tax_amount) stored,
  currency         char(3) not null default 'MXN',
  payer_entity_id  uuid references public.legal_entities(id),
  recoverable      boolean not null default false,
  classification   public.expense_classification not null default 'pending',
  evidence_document_id uuid,
  source           text not null default 'excel',
  import_row_id    uuid,
  notes            text,
  created_by       uuid references public.profiles(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index expenses_org_period_idx on public.expenses (org_id, period);
create index expenses_development_idx on public.expenses (development_id);
create trigger trg_expenses_updated before update on public.expenses
  for each row execute function public.set_updated_at();
create trigger trg_expenses_reference before insert or update on public.expenses
  for each row execute function public.reject_reference_only_unit();
create trigger trg_expenses_audit after insert or update or delete on public.expenses
  for each row execute function public.audit_row();

-- Prorrateo de un gasto entre partes (copropietarios/arrendatarios), como el
-- bloque de servicios de CXC Mensual: porcentaje × factor → importe.
create table public.expense_shares (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  expense_id    uuid not null references public.expenses(id) on delete cascade,
  entity_id     uuid references public.legal_entities(id),
  tenant_id     uuid references public.tenants(id),
  share_pct     numeric(7,4) check (share_pct >= 0 and share_pct <= 100),
  factor        numeric(8,4) not null default 1,        -- p. ej. 1.05 o 1.5 (pendiente de explicación)
  amount        numeric(14,2) not null check (amount >= 0),
  rule_note     text,
  created_at    timestamptz not null default now(),
  constraint expense_shares_one_party check (num_nonnulls(entity_id, tenant_id) = 1)
);
create index expense_shares_expense_idx on public.expense_shares (expense_id);

create table public.expense_payments (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  expense_id   uuid not null references public.expenses(id) on delete cascade,
  paid_at      date not null,
  amount       numeric(14,2) not null check (amount > 0),
  method       public.payment_method not null default 'transfer',
  bank_ref     text,
  created_at   timestamptz not null default now()
);
create index expense_payments_expense_idx on public.expense_payments (expense_id);

-- Vínculo gasto ↔ cargo de recuperación. Nunca compensación automática.
create table public.expense_recoveries (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  expense_id   uuid not null references public.expenses(id) on delete cascade,
  charge_id    uuid not null references public.charges(id) on delete cascade,
  amount       numeric(14,2) not null check (amount > 0),
  created_at   timestamptz not null default now(),
  unique (expense_id, charge_id)
);
