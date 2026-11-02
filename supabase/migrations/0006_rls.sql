-- 0006 · Row Level Security. Matriz de roles del plan §4:
--   viewer   : lee patrimonio, contratos (sin datos protegidos), documentos public_internal
--   operator : + lee/escribe cargos, pagos, gastos, datos protegidos, importaciones
--   admin    : + ajustes, cierres, fuente de verdad, usuarios/invitaciones, borrar
-- anon no ve nada. Toda política usa funciones SECURITY DEFINER de 0001.

-- Defensa en profundidad: anon sin privilegios en public.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

-- ---------------------------------------------------------------- generador de políticas
-- mode:
--   'member_read_ops_write' → select: miembro; insert/update: admin|operator; delete: admin
--   'ops_only'              → select/insert/update: admin|operator; delete: admin
--   'ops_read_admin_write'  → select: admin|operator; insert/update/delete: admin
--   'member_read_admin_write' → select: miembro; insert/update/delete: admin
create or replace function public.apply_std_policies(p_table text, p_mode text)
returns void language plpgsql as $$
declare
  t text := format('public.%I', p_table);
  r_sel text; r_write text; r_del text := 'public.has_role(org_id, ''admin'')';
begin
  execute format('alter table %s enable row level security', t);
  execute format('alter table %s force row level security', t);

  case p_mode
    when 'member_read_ops_write' then
      r_sel := 'public.is_member(org_id)';
      r_write := 'public.has_role(org_id, ''admin'', ''operator'')';
    when 'ops_only' then
      r_sel := 'public.has_role(org_id, ''admin'', ''operator'')';
      r_write := r_sel;
    when 'ops_read_admin_write' then
      r_sel := 'public.has_role(org_id, ''admin'', ''operator'')';
      r_write := 'public.has_role(org_id, ''admin'')';
    when 'member_read_admin_write' then
      r_sel := 'public.is_member(org_id)';
      r_write := 'public.has_role(org_id, ''admin'')';
    else raise exception 'modo desconocido %', p_mode;
  end case;

  execute format('create policy %I on %s for select to authenticated using (%s)', p_table || '_select', t, r_sel);
  execute format('create policy %I on %s for insert to authenticated with check (%s)', p_table || '_insert', t, r_write);
  execute format('create policy %I on %s for update to authenticated using (%s) with check (%s)', p_table || '_update', t, r_write, r_write);
  execute format('create policy %I on %s for delete to authenticated using (%s)', p_table || '_delete', t, r_del);
end $$;

-- ---------------------------------------------------------------- patrimonio y contratos (lectura general)
select public.apply_std_policies(t, 'member_read_ops_write') from unnest(array[
  'legal_entities', 'developments', 'assets', 'units', 'ownership_interests', 'surfaces', 'geometries',
  'tenants', 'tenant_aliases', 'leases', 'lease_units', 'lease_terms',
  'document_versions', 'document_links', 'critical_dates',
  'import_batches', 'import_rows', 'import_discrepancies', 'source_records'
]) as t;

-- ---------------------------------------------------------------- finanzas y datos protegidos (solo operación)
select public.apply_std_policies(t, 'ops_only') from unnest(array[
  'legal_entity_details', 'tenant_details',
  'charges', 'payments', 'payment_allocations',
  'expenses', 'expense_shares', 'expense_payments', 'expense_recoveries'
]) as t;

-- ---------------------------------------------------------------- solo admin escribe
select public.apply_std_policies('charge_adjustments', 'ops_read_admin_write');
select public.apply_std_policies(t, 'member_read_admin_write') from unnest(array[
  'source_of_truth_rules', 'period_locks', 'memberships'
]) as t;

-- ---------------------------------------------------------------- casos especiales
-- organizations: miembros leen; solo admin edita; nadie crea/borra por API.
alter table public.organizations enable row level security;
alter table public.organizations force row level security;
create policy organizations_select on public.organizations for select to authenticated
  using (public.is_member(id));
create policy organizations_update on public.organizations for update to authenticated
  using (public.has_role(id, 'admin')) with check (public.has_role(id, 'admin'));

-- profiles: el propio y los de compañeros de organización; solo edita el propio.
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
create policy profiles_select on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1 from public.memberships m
      where m.profile_id = profiles.id and m.org_id in (select public.auth_org_ids()))
  );
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- invitations: solo admin de la organización.
alter table public.invitations enable row level security;
alter table public.invitations force row level security;
create policy invitations_admin on public.invitations for all to authenticated
  using (public.has_role(org_id, 'admin')) with check (public.has_role(org_id, 'admin'));

-- audit_logs: solo lectura para admin; se escribe únicamente por trigger (definer).
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;
create policy audit_logs_select on public.audit_logs for select to authenticated
  using (org_id is not null and public.has_role(org_id, 'admin'));

-- documents: visibilidad por sensibilidad × rol.
create or replace function public.can_view_document(p_org uuid, p_sens public.document_sensitivity)
returns boolean language sql stable security definer set search_path = public as $$
  select case p_sens
    when 'public_internal' then public.is_member(p_org)
    when 'restricted'      then public.has_role(p_org, 'admin', 'operator')
    when 'sensitive'       then public.has_role(p_org, 'admin')
  end
$$;
revoke execute on function public.can_view_document(uuid, public.document_sensitivity) from anon;

alter table public.documents enable row level security;
alter table public.documents force row level security;
create policy documents_select on public.documents for select to authenticated
  using (public.can_view_document(org_id, sensitivity));
create policy documents_insert on public.documents for insert to authenticated
  with check (public.can_view_document(org_id, sensitivity) and public.has_role(org_id, 'admin', 'operator'));
create policy documents_update on public.documents for update to authenticated
  using (public.can_view_document(org_id, sensitivity) and public.has_role(org_id, 'admin', 'operator'))
  with check (public.can_view_document(org_id, sensitivity) and public.has_role(org_id, 'admin', 'operator'));
create policy documents_delete on public.documents for delete to authenticated
  using (public.has_role(org_id, 'admin'));

-- ---------------------------------------------------------------- Storage: buckets privados
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('legal',      'legal',      false, 52428800),
  ('fiscal',     'fiscal',     false, 52428800),
  ('technical',  'technical',  false, 104857600),
  ('commercial', 'commercial', false, 52428800),
  ('imports',    'imports',    false, 52428800)
on conflict (id) do update set public = false;

-- Convención de ruta: <org_id>/<lo que sea>. El primer segmento decide la
-- organización; el bucket decide el rol mínimo. viewer no accede a Storage
-- directamente: recibe URLs firmadas desde el servidor cuando el documento
-- es public_internal.
create or replace function public.storage_org_id(p_name text)
returns uuid language sql immutable as $$
  select case when (storage.foldername(p_name))[1] ~ '^[0-9a-f-]{36}$'
              then (storage.foldername(p_name))[1]::uuid end
$$;

create policy stone_storage_read on storage.objects for select to authenticated
  using (
    bucket_id in ('legal', 'fiscal', 'technical', 'commercial', 'imports')
    and (
      (bucket_id = 'legal' and public.has_role(public.storage_org_id(name), 'admin'))
      or (bucket_id <> 'legal' and public.has_role(public.storage_org_id(name), 'admin', 'operator'))
    )
  );
create policy stone_storage_write on storage.objects for insert to authenticated
  with check (
    bucket_id in ('legal', 'fiscal', 'technical', 'commercial', 'imports')
    and (
      (bucket_id = 'legal' and public.has_role(public.storage_org_id(name), 'admin'))
      or (bucket_id <> 'legal' and public.has_role(public.storage_org_id(name), 'admin', 'operator'))
    )
  );
create policy stone_storage_update on storage.objects for update to authenticated
  using (bucket_id in ('legal', 'fiscal', 'technical', 'commercial', 'imports')
         and public.has_role(public.storage_org_id(name), 'admin', 'operator'));
create policy stone_storage_delete on storage.objects for delete to authenticated
  using (bucket_id in ('legal', 'fiscal', 'technical', 'commercial', 'imports')
         and public.has_role(public.storage_org_id(name), 'admin'));
