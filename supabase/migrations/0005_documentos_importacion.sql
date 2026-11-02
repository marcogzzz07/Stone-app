-- 0005 · Documentos privados, importaciones (lotes, filas, discrepancias,
-- claves de idempotencia), fuente de verdad por alcance, cierres de período,
-- fechas críticas. Más las FK diferidas desde 0002–0004.

create type public.document_sensitivity as enum ('public_internal', 'restricted', 'sensitive');
create type public.document_kind as enum ('contrato', 'escritura', 'plano', 'factura', 'comprobante_pago', 'poliza', 'predial', 'reporte', 'foto', 'otro');
create type public.link_target as enum ('development', 'asset', 'unit', 'lease', 'tenant', 'charge', 'payment', 'expense', 'legal_entity', 'import_batch');
create type public.import_status as enum ('uploaded', 'parsed', 'reviewed', 'applied', 'rejected');
create type public.import_row_class as enum ('new', 'duplicate', 'possible_duplicate', 'conflict', 'incomplete');
create type public.import_row_decision as enum ('pending', 'accept', 'skip');
create type public.severity as enum ('info', 'warning', 'danger');
create type public.discrepancy_status as enum ('open', 'acknowledged', 'resolved');
create type public.truth_source as enum ('excel', 'stone');
create type public.period_status as enum ('open', 'under_review', 'closed');
create type public.critical_date_kind as enum ('lease_end', 'property_tax', 'insurance', 'rent_increase', 'other');

-- ---------------------------------------------------------------- documentos
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  bucket        text not null,                 -- legal | fiscal | technical | commercial | imports
  path          text not null,                 -- <org_id>/<...>; siempre bucket privado
  title         text not null,
  kind          public.document_kind not null default 'otro',
  sensitivity   public.document_sensitivity not null default 'restricted',
  mime_type     text,
  size_bytes    bigint,
  uploaded_by   uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (bucket, path)
);
create trigger trg_documents_updated before update on public.documents
  for each row execute function public.set_updated_at();

create table public.document_versions (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  document_id   uuid not null references public.documents(id) on delete cascade,
  version       integer not null,
  path          text not null,
  size_bytes    bigint,
  uploaded_by   uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  unique (document_id, version)
);

create table public.document_links (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  document_id   uuid not null references public.documents(id) on delete cascade,
  target_type   public.link_target not null,
  target_id     uuid not null,
  created_at    timestamptz not null default now(),
  unique (document_id, target_type, target_id)
);
create index document_links_target_idx on public.document_links (target_type, target_id);

-- FK diferidas hacia documents
alter table public.ownership_interests
  add constraint ownership_source_document_fk foreign key (source_document_id) references public.documents(id) on delete set null;
alter table public.leases
  add constraint leases_contract_document_fk foreign key (contract_document_id) references public.documents(id) on delete set null;
alter table public.payments
  add constraint payments_evidence_document_fk foreign key (evidence_document_id) references public.documents(id) on delete set null;
alter table public.expenses
  add constraint expenses_evidence_document_fk foreign key (evidence_document_id) references public.documents(id) on delete set null;

-- ---------------------------------------------------------------- importaciones
create table public.import_batches (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  file_document_id uuid references public.documents(id),
  file_name       text not null,
  file_sha256     text,
  report_period   date,                          -- mes de corte del reporte
  sheets          text[] not null default '{}',
  mapping         jsonb not null default '{}'::jsonb,
  status          public.import_status not null default 'uploaded',
  summary         jsonb not null default '{}'::jsonb,   -- conteos, totales recalculados vs Resumen
  created_by      uuid references public.profiles(id),
  reviewed_by     uuid references public.profiles(id),
  applied_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index import_batches_org_idx on public.import_batches (org_id, created_at desc);
create trigger trg_import_batches_updated before update on public.import_batches
  for each row execute function public.set_updated_at();

create table public.import_rows (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id) on delete cascade,
  batch_id       uuid not null references public.import_batches(id) on delete cascade,
  sheet          text not null,
  row_number     integer not null,
  raw            jsonb not null,                 -- celdas tal cual (origen inmutable)
  normalized     jsonb,                          -- tras alias/normalización
  classification public.import_row_class not null default 'new',
  decision       public.import_row_decision not null default 'pending',
  decided_by     uuid references public.profiles(id),
  decided_at     timestamptz,
  target_type    public.link_target,
  target_id      uuid,
  message        text,
  created_at     timestamptz not null default now(),
  unique (batch_id, sheet, row_number)
);
create index import_rows_batch_class_idx on public.import_rows (batch_id, classification);

-- Clave de idempotencia por registro de origen (spec §9.2): folio si existe;
-- si no, combinación controlada org+hoja+cliente+período+concepto+importe.
create table public.source_records (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  source_key    text not null,
  target_type   public.link_target not null,
  target_id     uuid not null,
  first_batch_id uuid references public.import_batches(id),
  last_batch_id  uuid references public.import_batches(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (org_id, source_key)
);
create trigger trg_source_records_updated before update on public.source_records
  for each row execute function public.set_updated_at();

-- Diferencias entre lo recalculado y lo que dice el Excel (o entre hojas).
-- Nunca se corrigen en silencio: se registran y alguien las resuelve.
create table public.import_discrepancies (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id) on delete cascade,
  batch_id       uuid references public.import_batches(id) on delete cascade,
  kind           text not null,                   -- 'pendiente_no_cuadra', 'ref_rota', 'fecha_año', 'alias_nuevo', …
  severity       public.severity not null default 'warning',
  sheet          text,
  cell_ref       text,
  description    text not null,
  expected       numeric(14,2),
  actual         numeric(14,2),
  target_type    public.link_target,
  target_id      uuid,
  status         public.discrepancy_status not null default 'open',
  resolution     text,
  resolved_by    uuid references public.profiles(id),
  resolved_at    timestamptz,
  created_at     timestamptz not null default now()
);
create index import_discrepancies_org_status_idx on public.import_discrepancies (org_id, status, severity);

-- FK diferidas hacia import_rows
alter table public.charges
  add constraint charges_import_row_fk foreign key (import_row_id) references public.import_rows(id) on delete set null;
alter table public.payments
  add constraint payments_import_row_fk foreign key (import_row_id) references public.import_rows(id) on delete set null;
alter table public.expenses
  add constraint expenses_import_row_fk foreign key (import_row_id) references public.import_rows(id) on delete set null;

-- ---------------------------------------------------------------- fuente de verdad y cierres
create table public.source_of_truth_rules (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id) on delete cascade,
  scope_type     public.link_target not null check (scope_type in ('development', 'asset', 'lease')),
  scope_id       uuid not null,
  period_from    date not null,
  source         public.truth_source not null,
  authorized_by  uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  unique (scope_type, scope_id, period_from)
);

create table public.period_locks (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id) on delete cascade,
  period         date not null check (period = date_trunc('month', period)::date),
  scope_type     public.link_target,
  scope_id       uuid,
  status         public.period_status not null default 'open',
  changed_by     uuid references public.profiles(id),
  changed_at     timestamptz not null default now(),
  notes          text,
  unique nulls not distinct (org_id, period, scope_type, scope_id)
);

-- ---------------------------------------------------------------- fechas críticas
create table public.critical_dates (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  kind          public.critical_date_kind not null,
  title         text not null,
  due_on        date not null,
  target_type   public.link_target,
  target_id     uuid,
  done_at       timestamptz,
  notes         text,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now()
);
create index critical_dates_org_due_idx on public.critical_dates (org_id, due_on) where done_at is null;
